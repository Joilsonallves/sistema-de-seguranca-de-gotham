from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin

# Inicializando extensões
db = SQLAlchemy()
bcrypt = Bcrypt()
login_manager = LoginManager()
login_manager.login_view = 'login'  # Redireciona para a página de login caso o usuário não esteja autenticado

# Função para carregar o usuário
@login_manager.user_loader
def load_user(user_id):
    return Usuario.query.get(int(user_id))

# Modelo do Usuário
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    senha_hash = db.Column(db.String(150), nullable=False)
    cargo = db.Column(db.String(50), nullable=False)  # Atributo para o cargo (admin, gerente, funcionario)

    def __init__(self, nome, email, senha, cargo):
        self.nome = nome
        self.email = email
        self.senha_hash = bcrypt.generate_password_hash(senha).decode('utf-8')
        self.cargo = cargo

        # Métodos obrigatórios do Flask-Login
    @property
    def is_authenticated(self):
        return True  # Todos os usuários são considerados autenticados

    @property
    def is_active(self):
        return True  # Todas as contas são consideradas ativas

    @property
    def is_anonymous(self):
        return False  # Usuários reais, não anônimos

    def get_id(self):
        return str(self.id)  # Retorna o ID do usuário como string

# Modelo do Dispositivo
class Dispositivo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    categoria = db.Column(db.String(50), nullable=False)
    localizacao = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    fabricante = db.Column(db.String(100), nullable=False)
    data_instalacao = db.Column(db.Date, nullable=False)  # Alterado para db.Date

# Modelo do Veículo
class Veiculo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    modelo = db.Column(db.String(100), nullable=False)
    placa = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    localizacao = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)

# Modelo do Inventário
class Inventario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome_equipamento = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    localizacao = db.Column(db.String(100), nullable=False)

# Função para inicializar o banco de dados
def init_db(app):
    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)

# Criar banco de dados e usuário admin
def criar_admin(app):
    with app.app_context():
        db.create_all()  # Cria todas as tabelas no banco de dados

        # Verifica se já existe um admin no banco
        admin_email = "admin@gotham.com"
        admin_senha = "batman123"
        admin_nome = "admin"

        if not Usuario.query.filter_by(email=admin_email).first():
            admin = Usuario(
                nome=admin_nome,
                email=admin_email,
                senha=admin_senha,
                cargo="admin"  # Define o cargo como "admin"
            )
            db.session.add(admin)
            db.session.commit()
            print("Usuário administrador criado com sucesso!")

if __name__ == '__main__':
    from flask import Flask
    app = Flask(__name__)

    # Configurações do banco de dados
    app.config['SECRET_KEY'] = 'chave_secreta_super_segura'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db_projeto.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    init_db(app)  # Inicializa o banco de dados com a instância do Flask
    criar_admin(app)  # Cria o usuário administrador
    print("Banco de dados inicializado com sucesso!")