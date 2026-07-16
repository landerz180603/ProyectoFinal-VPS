<?php
/**
 * Tienda Locores - API REST
 * 
 * Endpoints:
 * - GET /api                    → Estado API
 * - GET /api/usuarios           → Listar usuarios
 * - POST /api/usuarios          → Crear usuario
 * - GET /api/usuarios/{id}      → Obtener usuario
 * - PUT /api/usuarios/{id}      → Actualizar usuario
 * - DELETE /api/usuarios/{id}   → Eliminar usuario
 */

// Headers CORS
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuración de base de datos
class Database {
    private $pdo;
    
    public function __construct() {
        $host = $_ENV['DB_HOST'] ?? 'postgres';
        $port = $_ENV['DB_PORT'] ?? '5432';
        $user = $_ENV['DB_USER'] ?? 'locores_user';
        $pass = $_ENV['DB_PASSWORD'] ?? 'locores_pass';
        $name = $_ENV['DB_NAME'] ?? 'locores_db';
        
        try {
            $this->pdo = new PDO(
                "pgsql:host=$host;port=$port;dbname=$name",
                $user,
                $pass,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_PERSISTENT => false
                ]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit();
        }
    }
    
    public function getPDO() {
        return $this->pdo;
    }
}

// Clase API
class API {
    private $db;
    private $method;
    private $path;
    
    public function __construct($database) {
        $this->db = $database->getPDO();
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    }
    
    public function handle() {
        // Rutas
        if ($this->path === '/api' && $this->method === 'GET') {
            return $this->getStatus();
        }
        elseif ($this->path === '/api/usuarios' && $this->method === 'GET') {
            return $this->getUsuarios();
        }
        elseif ($this->path === '/api/usuarios' && $this->method === 'POST') {
            return $this->createUsuario();
        }
        else {
            return $this->notFound();
        }
    }
    
    private function getStatus() {
        return [
            'status' => 'ok',
            'message' => 'API Tienda Locores v1.0',
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => '1.0.0'
        ];
    }
    
    private function getUsuarios() {
        try {
            $stmt = $this->db->query('SELECT id, email, nombre, created_at FROM usuarios ORDER BY created_at DESC LIMIT 100');
            $usuarios = $stmt->fetchAll();
            
            return [
                'success' => true,
                'data' => $usuarios,
                'count' => count($usuarios)
            ];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => $e->getMessage()];
        }
    }
    
    private function createUsuario() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validar datos
            if (!isset($data['email']) || !isset($data['nombre']) || !isset($data['password'])) {
                http_response_code(400);
                return ['error' => 'Missing required fields: email, nombre, password'];
            }
            
            if (strlen($data['password']) < 6) {
                http_response_code(400);
                return ['error' => 'Password must be at least 6 characters'];
            }
            
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                return ['error' => 'Invalid email format'];
            }
            
            // Verificar email duplicado
            $check = $this->db->prepare('SELECT id FROM usuarios WHERE email = ?');
            $check->execute([$data['email']]);
            if ($check->fetch()) {
                http_response_code(409);
                return ['error' => 'Email already registered'];
            }
            
            // Crear usuario
            $hashed_password = password_hash($data['password'], PASSWORD_BCRYPT);
            $stmt = $this->db->prepare('INSERT INTO usuarios (email, nombre, password) VALUES (?, ?, ?) RETURNING id');
            $stmt->execute([$data['email'], $data['nombre'], $hashed_password]);
            
            $result = $stmt->fetch();
            
            http_response_code(201);
            return [
                'success' => true,
                'message' => 'Usuario creado exitosamente',
                'id' => $result['id']
            ];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => $e->getMessage()];
        }
    }
    
    private function notFound() {
        http_response_code(404);
        return ['error' => 'Endpoint not found', 'path' => $this->path, 'method' => $this->method];
    }
}

// Ejecutar
try {
    $database = new Database();
    $api = new API($database);
    $response = $api->handle();
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
