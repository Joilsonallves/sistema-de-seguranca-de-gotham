from datetime import datetime
from flask import Flask, render_template, redirect, url_for, request, flash, jsonify
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from database import db, Usuario, Dispositivo, Veiculo, Inventario, init_db, criar_admin  # Importando do database.py

# Inicializando o aplicativo Flask
app = Flask(__name__)

# Configurações do banco de dados
app.config['SECRET_KEY'] = 'chave_secreta_super_segura'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db_projeto.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializando extensões
db.init_app(app)  # Inicializa o SQLAlchemy com a instância do Flask
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return Usuario.query.get(int(user_id))

@app.route('/')
def home():
    return render_template('index.html')  # Página inicial

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        senha = request.form['senha']
        usuario = Usuario.query.filter_by(email=email).first()

        if usuario and bcrypt.check_password_hash(usuario.senha_hash, senha):
            login_user(usuario)
            flash("Login realizado com sucesso!", "success")
            return redirect(url_for('dashboard'))
        else:
            flash("E-mail ou senha incorretos!", "danger")
            return redirect(url_for('login'))  # Redireciona de volta para a página de login em caso de falha

    return render_template('login.html')  # Renderiza a página de login para solicitações GET

@app.route('/usuarios', methods=['GET'])
@login_required
def usuarios():
    usuarios = Usuario.query.all()
    return jsonify([{
        'id': usuario.id,
        'nome': usuario.nome,
        'email': usuario.email,
        'cargo': usuario.cargo  # Usando o atributo 'cargo' em vez de 'admin'
    } for usuario in usuarios])

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash("Logout realizado com sucesso!", "info")
    return redirect(url_for('home'))

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')  # Renderiza a página do dashboard

# Rota para o Inventário
@app.route('/inventario')
@login_required
def inventario():
    return render_template('inventario.html')  # Renderiza a página de inventário

# Rota para Veículos
@app.route('/veiculos')
@login_required
def veiculos():
    return render_template('veiculos.html')  # Renderiza a página de veículos

# Rota para Dispositivos de Segurança
@app.route('/dispositivos')
@login_required
def dispositivos():
    return render_template('dispositivos.html')  # Renderiza a página de dispositivos

@app.route('/carregar_dispositivos', methods=['GET'])
def carregar_dispositivos():
    dispositivos = Dispositivo.query.all()
    dispositivos_json = [{
        "id": d.id,
        "nome": d.nome,
        "categoria": d.categoria,
        "status": d.status,
        "localizacao": d.localizacao,
        "fabricante": d.fabricante,
        "data_instalacao": d.data_instalacao
    } for d in dispositivos]
    return jsonify(dispositivos_json)

@app.route('/adicionar_dispositivo', methods=['POST'])
def adicionar_dispositivo():
    data = request.get_json()
    try:
        print("Dados recebidos:", data)  # Log dos dados recebidos

        # Verifica se todos os campos obrigatórios estão presentes
        campos_obrigatorios = ['nome', 'categoria', 'localizacao', 'status', 'fabricante', 'dataInstalacao']
        for campo in campos_obrigatorios:
            if campo not in data:
                print(f"Campo '{campo}' faltando no JSON.")  # Log do erro
                return jsonify({"success": False, "message": f"Campo '{campo}' é obrigatório!"}), 400

        # Verifica se o dispositivo já existe
        dispositivo_existente = Dispositivo.query.filter_by(
            nome=data['nome'],
            fabricante=data['fabricante']
        ).first()

        if dispositivo_existente:
            return jsonify({"success": False, "message": "Dispositivo já cadastrado!"}), 400

        # Converte a data de instalação para o formato correto
        from datetime import datetime
        data_instalacao = datetime.strptime(data['dataInstalacao'], '%Y-%m-%d').date()

        novo_dispositivo = Dispositivo(
            nome=data['nome'],
            categoria=data['categoria'],
            localizacao=data['localizacao'],
            status=data['status'],
            fabricante=data['fabricante'],
            data_instalacao=data_instalacao
        )
        db.session.add(novo_dispositivo)
        db.session.commit()
        return jsonify({"success": True, "message": "Dispositivo adicionado com sucesso!"})
    except Exception as e:
        print(f"Erro ao adicionar dispositivo: {e}")  # Log do erro
        return jsonify({"success": False, "message": str(e)}), 500

# Rota para obter dispositivos por categoria
@app.route('/dispositivos/<int:id>', methods=['GET'])
def obter_dispositivo(id):
    try:
        dispositivo = Dispositivo.query.get_or_404(id)
        return jsonify({
            "id": dispositivo.id,
            "nome": dispositivo.nome,
            "categoria": dispositivo.categoria,
            "localizacao": dispositivo.localizacao,
            "status": dispositivo.status,
            "fabricante": dispositivo.fabricante,
            "data_instalacao": dispositivo.data_instalacao.strftime('%Y-%m-%d')  # Formata a data
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# Rota para editar um dispositivo
@app.route('/editar_dispositivo/<int:id>', methods=['PUT'])
def editar_dispositivo(id):
    try:
        # Obtém o dispositivo pelo ID
        dispositivo = Dispositivo.query.get_or_404(id)

        # Obtém os dados enviados no corpo da requisição
        data = request.get_json()

        # Atualiza os campos do dispositivo
        dispositivo.nome = data.get('nome', dispositivo.nome)
        dispositivo.categoria = data.get('categoria', dispositivo.categoria)
        dispositivo.localizacao = data.get('localizacao', dispositivo.localizacao)
        dispositivo.status = data.get('status', dispositivo.status)
        dispositivo.fabricante = data.get('fabricante', dispositivo.fabricante)
        dispositivo.data_instalacao = datetime.strptime(data.get('dataInstalacao'), '%Y-%m-%d').date()

        # Salva as alterações no banco de dados
        db.session.commit()

        return jsonify({"success": True, "message": "Dispositivo atualizado com sucesso!"})
    except Exception as e:
        # Em caso de erro, faz rollback e retorna uma mensagem de erro
        db.session.rollback()
        print(f"Erro ao editar dispositivo: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

# Rota para remover um dispositivo
@app.route('/remover_dispositivo/<int:id>', methods=['DELETE'])
@login_required
def remover_dispositivo(id):
    try:
        dispositivo = Dispositivo.query.get_or_404(id)
        db.session.delete(dispositivo)
        db.session.commit()
        return jsonify({"success": True, "message": "Dispositivo removido com sucesso!"})
    except Exception as e:
        print(f"Erro ao remover dispositivo: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

# Rota para a página de configurações
@app.route('/configuracoes')
@login_required
def configuracoes():
    if current_user.cargo != "admin":  # Verifica se o usuário é um administrador
        flash("Acesso negado! Apenas administradores podem acessar esta página.", "danger")
        return redirect(url_for('dashboard'))
    return render_template('configuracoes.html')

# Rota para adicionar usuário (via AJAX)
@app.route('/adicionar_usuario', methods=['POST'])
@login_required
def adicionar_usuario():
    try:
        if current_user.cargo != "admin":  # Verifica se o usuário é um administrador
            return jsonify({"success": False, "message": "Acesso negado!"})

        data = request.get_json()
        print("Dados recebidos:", data)  # Log dos dados recebidos

        nome = data.get('nome')
        email = data.get('email')
        senha = data.get('senha')
        cargo = data.get('cargo')

        if Usuario.query.filter_by(email=email).first():
            return jsonify({"success": False, "message": "Email já cadastrado!"})

        senha_hash = bcrypt.generate_password_hash(senha).decode('utf-8')
        novo_usuario = Usuario(nome=nome, email=email, senha=senha_hash, cargo=cargo)  # Corrigido para 'senha_hash'
        db.session.add(novo_usuario)
        db.session.commit()

        return jsonify({"success": True, "message": "Usuário adicionado com sucesso!"})
    except Exception as e:
        print(f"Erro ao adicionar usuário: {e}")  # Log do erro
        return jsonify({"success": False, "message": str(e)}), 500

# Rota para listar usuários (via AJAX)
@app.route('/listar_usuarios', methods=['GET'])
@login_required
def listar_usuarios():
    if current_user.cargo != "admin":  # Verifica se o usuário é um administrador
        return jsonify({"success": False, "message": "Acesso negado!"})

    usuarios = Usuario.query.all()
    usuarios_json = [{
        "id": usuario.id,
        "nome": usuario.nome,
        "email": usuario.email,
        "cargo": usuario.cargo
    } for usuario in usuarios]
    return jsonify({"success": True, "usuarios": usuarios_json})

# Rota para obter dados de um usuário específico
@app.route('/usuarios/<int:id>', methods=['GET'])
@login_required
def obter_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    return jsonify({
        "id": usuario.id,
        "nome": usuario.nome,
        "email": usuario.email,
        "cargo": usuario.cargo
    })

# Rota para editar um usuário
@app.route('/editar_usuario/<int:id>', methods=['PUT'])
@login_required
def editar_usuario(id):
    if current_user.cargo != "admin":  # Verifica se o usuário é um administrador
        return jsonify({"success": False, "message": "Acesso negado!"})

    usuario = Usuario.query.get_or_404(id)
    data = request.get_json()
    usuario.nome = data.get('nome', usuario.nome)
    usuario.email = data.get('email', usuario.email)
    usuario.cargo = data.get('cargo', usuario.cargo)

    if 'senha' in data and data['senha']:
        usuario.senha_hash = bcrypt.generate_password_hash(data['senha']).decode('utf-8')

    db.session.commit()
    return jsonify({"success": True, "message": "Usuário atualizado com sucesso!"})

# Rota para remover usuário (via AJAX)
@app.route('/remover_usuario/<int:id>', methods=['DELETE'])
@login_required
def remover_usuario(id):
    if current_user.cargo != "admin":  # Verifica se o usuário é um administrador
        return jsonify({"success": False, "message": "Acesso negado!"})

    usuario = Usuario.query.get_or_404(id)
    db.session.delete(usuario)
    db.session.commit()
    return jsonify({"success": True, "message": "Usuário removido com sucesso!"})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Cria todas as tabelas
        criar_admin(app)  # Cria o usuário administrador padrão
    app.run(debug=True)