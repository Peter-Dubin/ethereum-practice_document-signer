# 📚 TAREA PARA ESTUDIANTE - ETH Database Document

## 🎯 Objetivo del Proyecto

Desarrollar una **aplicación descentralizada (dApp)** completa para almacenar y verificar la autenticidad de documentos utilizando blockchain Ethereum. El proyecto integra:

- **Smart Contracts** con Solidity y Foundry
- **Frontend Web** con Next.js, TypeScript y Ethers.js v6
- **Desarrollo Local** usando Anvil (nodo Ethereum local)

---

## 📋 Tabla de Contenidos

1. [Contexto del Proyecto](#contexto)
2. [Requisitos Previos](#requisitos)
3. [Fase 1: Smart Contracts](#fase-1)
4. [Fase 2: Frontend dApp](#fase-2)
5. [Fase 3: Integración](#fase-3)
6. [Fase 4: Testing](#fase-4)
7. [Checklist de Entrega](#checklist)
8. [Criterios de Evaluación](#evaluacion)
9. [Recursos de Ayuda](#recursos)

---

## 🌟 Contexto del Proyecto {#contexto}

### ¿Qué vas a construir?

Un sistema que permite:
- ✅ Subir documentos y calcular su hash criptográfico
- ✅ Firmar digitalmente el hash del documento
- ✅ Almacenar hash + firma + timestamp en blockchain
- ✅ Verificar autenticidad comparando hash y firma
- ✅ Ver historial de documentos almacenados

### ¿Por qué es importante?

- **Inmutabilidad**: Una vez almacenado, no se puede modificar
- **Trazabilidad**: Registro permanente de quién firmó y cuándo
- **Descentralización**: No depende de servidores centralizados
- **Seguridad**: Usa criptografía ECDSA para firmas digitales

---

## 📦 Requisitos Previos {#requisitos}

### Software Necesario

```bash
# 1. Node.js (v18+)
node --version  # debe mostrar v18 o superior

# 2. Foundry (Forge, Cast, Anvil) | StudentNote: Mine is actually a laptop running Windows 11 so maybe I'd need to to download this via WSL
curl -L https://foundry.paradigm.xyz | bash
foundryup

# 3. Git
git --version

# 4. Editor de código (VSCode recomendado)
```

### Conocimientos Previos

- ✅ JavaScript/TypeScript básico
- ✅ React y hooks (useState, useEffect, useContext)
- ✅ Solidity básico (structs, mappings, events)
- ✅ Terminal/línea de comandos
- ✅ Conceptos de blockchain (transacciones, wallets, gas)

---

## 🔧 Fase 1: Smart Contracts {#fase-1}

### Objetivo
Crear un contrato inteligente optimizado para almacenar y verificar documentos.

### Tareas a Realizar

#### 1.1 Estructura del Contrato

**Archivo**: `sc/src/DocumentRegistry.sol`

```solidity
// Implementar struct Document con:
// - bytes32 hash
// - uint256 timestamp  
// - address signer
// - bytes signature
```

**Puntos clave**:
- ❌ NO incluir campo `bool exists` (redundante)
- ❌ NO usar mapping `hashExists` separado (redundante)
- ✅ Usar `documents[hash].signer != address(0)` para verificar existencia

**¿Por qué es importante la optimización?**
- Ahorra ~39% de gas en almacenamiento
- Reduce slots de storage usados
- Código más limpio y mantenible

#### 1.2 Funciones Principales

Implementar estas funciones:

```solidity
// 1. Almacenar documento
function storeDocumentHash(
    bytes32 _hash,
    uint256 _timestamp,
    bytes memory _signature,
    address _signer
) external

// 2. Verificar documento
function verifyDocument(
    bytes32 _hash,
    address _signer,
    bytes memory _signature
) external returns (bool)

// 3. Obtener información
function getDocumentInfo(bytes32 _hash) external view returns (Document memory)

// 4. Verificar si existe
function isDocumentStored(bytes32 _hash) external view returns (bool)

// 5. Contar documentos
function getDocumentCount() external view returns (uint256)

// 6. Obtener por índice
function getDocumentHashByIndex(uint256 _index) external view returns (bytes32)
```

#### 1.3 Modifiers de Seguridad

```solidity
modifier documentNotExists(bytes32 _hash) {
    require(documents[_hash].signer == address(0), "Document already exists");
    _;
}

modifier documentExists(bytes32 _hash) {
    require(documents[_hash].signer != address(0), "Document does not exist");
    _;
}
```

#### 1.4 Testing del Contrato

**Archivo**: `sc/test/DocumentRegistry.t.sol`

Implementar tests para:
- ✅ Almacenar documento correctamente
- ✅ Verificar documento existente
- ✅ Rechazar documentos duplicados
- ✅ Obtener información correcta
- ✅ Contar documentos
- ✅ Iterar por índice
- ✅ Rechazar documentos inexistentes

**Comando para ejecutar tests**:
```bash
cd sc
forge test -vv
```

**Objetivo**: 11/11 tests pasando ✅

#### 1.5 Script de Despliegue

**Archivo**: `sc/script/Deploy.s.sol`

```solidity
// Desplegar DocumentRegistry en Anvil
// Loggear la dirección del contrato desplegado
```

**Comando para desplegar**:
```bash
forge script script/Deploy.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

---

## 💻 Fase 2: Frontend dApp {#fase-2}

### Objetivo
Crear una interfaz web moderna para interactuar con el smart contract.

### Tareas a Realizar

#### 2.1 Configuración del Proyecto Next.js

```bash
cd dapp
npm install

# Dependencias principales:
# - ethers@^6.0.0
# - next@14+
# - react@18+
# - typescript
# - tailwindcss
# - lucide-react (iconos)
```

#### 2.2 Context Provider para Wallets

**Archivo**: `dapp/contexts/MetaMaskContext.tsx`

Implementar:
```typescript
// 1. Derivar wallets desde mnemonic de Anvil
const ANVIL_MNEMONIC = process.env.NEXT_PUBLIC_MNEMONIC || ""
const ANVIL_WALLETS = Array.from({ length: 10 }, (_, i) => {
  const path = `m/44'/60'/0'/0/${i}`
  const wallet = ethers.HDNodeWallet.fromPhrase(ANVIL_MNEMONIC, undefined, path)
  return { address: wallet.address, privateKey: wallet.privateKey }
})

// 2. Crear JsonRpcProvider
const provider = new ethers.JsonRpcProvider('http://localhost:8545')

// 3. Funciones del contexto
// - connect(walletIndex)
// - disconnect()
// - signMessage(message)
// - getSigner()
// - switchWallet(walletIndex)
```

**Puntos clave**:
- ✅ Usar Context API para estado global
- ✅ Derivar wallets dinámicamente desde mnemonic
- ✅ JsonRpcProvider en lugar de BrowserProvider
- ✅ Sin necesidad de MetaMask

#### 2.3 Hook useContract

**Archivo**: `dapp/hooks/useContract.ts`

Implementar funciones que interactúen con el contrato:

```typescript
export function useContract() {
  // 1. Conectar al contrato con ABI
  const contract = new ethers.Contract(address, ABI, provider)
  
  // 2. Funciones del contrato
  const storeDocumentHash = async (hash, timestamp, signature, signer) => {
    const signer = await getSigner()
    const tx = await contract.connect(signer).storeDocumentHash(...)
    await tx.wait()
  }
  
  const getDocumentInfo = async (hash) => {
    return await contract.getDocumentInfo(hash)
  }
  
  // ... más funciones
}
```

#### 2.4 Componentes de UI

##### A. FileUploader
**Archivo**: `dapp/components/FileUploader.tsx`

```typescript
// Funcionalidad:
// 1. Input para seleccionar archivo
// 2. Calcular hash keccak256 con ethers.js
// 3. Mostrar hash calculado
// 4. Emitir hash al componente padre
```

##### B. DocumentSigner
**Archivo**: `dapp/components/DocumentSigner.tsx`

```typescript
// Funcionalidad:
// 1. Recibir hash del documento
// 2. Alert de confirmación mostrando qué se firmará
// 3. Firmar con wallet.signMessage()
// 4. Alert de éxito con firma generada
// 5. Botón "Store on Blockchain"
// 6. Alert de confirmación antes de almacenar
// 7. Enviar transacción al contrato
```

##### C. DocumentVerifier
**Archivo**: `dapp/components/DocumentVerifier.tsx`

```typescript
// Funcionalidad:
// 1. Input para archivo a verificar
// 2. Input para dirección del firmante
// 3. Calcular hash del archivo
// 4. Consultar blockchain con isDocumentStored()
// 5. Obtener info con getDocumentInfo()
// 6. Comparar firmante
// 7. Mostrar resultado: ✅ válido o ❌ inválido
```

##### D. DocumentHistory
**Archivo**: `dapp/components/DocumentHistory.tsx`

```typescript
// Funcionalidad:
// 1. Obtener total con getDocumentCount()
// 2. Iterar con getDocumentHashByIndex(i)
// 3. Para cada hash, llamar getDocumentInfo()
// 4. Mostrar tabla con:
//    - Hash del documento
//    - Dirección del firmante
//    - Timestamp
//    - Firma (primeros/últimos caracteres)
```

#### 2.5 Página Principal

**Archivo**: `dapp/app/page.tsx`

Implementar:
```typescript
// 1. Tabs de navegación
const tabs = [
  { id: 'upload', label: 'Upload & Sign' },
  { id: 'verify', label: 'Verify' },
  { id: 'history', label: 'History' }
]

// 2. Selector de wallet
// - Dropdown con 10 wallets de Anvil
// - Mostrar dirección actual
// - Cambiar de wallet dinámicamente

// 3. Estado de conexión
// - Botón "Connect Wallet"
// - Indicador visual de conexión
// - Mostrar wallet actual

// 4. Renderizado condicional por tab
```

#### 2.6 Variables de Entorno

**Archivo**: `dapp/.env.local`

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_MNEMONIC="test test test test test test test test test test test junk"
```

---

## 🔗 Fase 3: Integración {#fase-3}

### Objetivo
Conectar smart contract con frontend y verificar funcionamiento completo.

### Tareas

#### 3.1 Iniciar Anvil (Terminal 1)
```bash
anvil
```

#### 3.2 Desplegar Contrato (Terminal 2)
```bash
cd sc
forge script script/Deploy.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

#### 3.3 Actualizar .env.local
```bash
# Copiar la dirección del contrato desplegado
NEXT_PUBLIC_CONTRACT_ADDRESS=0x<dirección-del-contrato>
```

#### 3.4 Iniciar Frontend (Terminal 3)
```bash
cd dapp
npm run dev
```

#### 3.5 Flujo de Prueba Completo

1. **Conectar Wallet**
   - Abrir http://localhost:3000
   - Click en "Connect Wallet"
   - Seleccionar Wallet 0

2. **Firmar Documento**
   - Ir a tab "Upload & Sign"
   - Subir archivo de prueba
   - Click en "Sign Document"
   - Confirmar en alert
   - Ver firma generada

3. **Almacenar en Blockchain**
   - Click en "Store on Blockchain"
   - Confirmar en alert
   - Ver transaction hash

4. **Verificar Documento**
   - Ir a tab "Verify"
   - Subir el mismo archivo
   - Pegar dirección de Wallet 0
   - Click en "Verify Document"
   - Ver resultado ✅ VÁLIDO

5. **Ver Historial**
   - Ir a tab "History"
   - Ver documento almacenado en la lista

---

## 🧪 Fase 4: Testing {#fase-4}

### Tests del Smart Contract

```bash
cd sc
forge test -vv
forge coverage
```

**Criterios**:
- ✅ 11/11 tests pasando
- ✅ >80% cobertura de código
- ✅ Todos los casos edge cubiertos

### Tests de Integración

**Escenarios a probar**:

1. **Happy Path**
   - Subir → Firmar → Almacenar → Verificar ✅

2. **Documento Duplicado**
   - Intentar almacenar mismo hash 2 veces
   - Debe fallar con error

3. **Verificación con Firmante Incorrecto**
   - Almacenar con Wallet 0
   - Verificar con dirección de Wallet 1
   - Debe mostrar ❌ INVÁLIDO

4. **Documento No Existente**
   - Verificar documento nunca almacenado
   - Debe mostrar "Document not found"

5. **Cambio de Wallet**
   - Firmar con Wallet 0
   - Cambiar a Wallet 1
   - Firmar otro documento
   - Verificar ambos funcionan

---

## ✅ Checklist de Entrega {#checklist}

### Smart Contracts

- [ ] `DocumentRegistry.sol` implementado y optimizado
- [ ] Struct sin campo `exists` redundante
- [ ] Sin mapping `hashExists` redundante
- [ ] 11/11 tests pasando
- [ ] Script de despliegue funcional
- [ ] Contrato desplegado en Anvil
- [ ] ABI exportado para frontend

### Frontend

- [ ] Context Provider implementado
- [ ] Wallets derivadas desde mnemonic
- [ ] Hook `useContract` funcional
- [ ] Componente `FileUploader` completo
- [ ] Componente `DocumentSigner` con alerts
- [ ] Componente `DocumentVerifier` funcional
- [ ] Componente `DocumentHistory` mostrando datos
- [ ] Página principal con tabs
- [ ] Selector de wallet funcionando
- [ ] UI responsiva y moderna

### Integración

- [ ] Frontend conecta con contrato
- [ ] Firmas funcionan correctamente
- [ ] Almacenamiento en blockchain exitoso
- [ ] Verificación funciona
- [ ] Historial muestra documentos

### Documentación

- [ ] README.md actualizado
- [ ] Comentarios en código
- [ ] Variables de entorno documentadas
- [ ] .gitignore configurado
- [ ] Instrucciones de instalación claras

### Git

- [ ] Repositorio inicializado
- [ ] Commits descriptivos
- [ ] `.gitignore` correcto (lib/, cache/, out/)
- [ ] Solo código fuente en repo (~50 KB)

---

## 📊 Criterios de Evaluación {#evaluacion}

### Funcionalidad (40%)
- Contrato despliega y funciona correctamente (10%)
- Frontend conecta con contrato (10%)
- Flujo completo funciona (Upload → Sign → Store → Verify) (15%)
- Manejo de errores adecuado (5%)

### Código (30%)
- Optimización del contrato (ahorro de gas) (10%)
- Código limpio y organizado (10%)
- Uso correcto de TypeScript (5%)
- Context API implementado correctamente (5%)

### Testing (15%)
- Tests del contrato pasando (10%)
- Tests de integración (5%)

### UI/UX (10%)
- Interfaz intuitiva y moderna (5%)
- Alerts de confirmación implementados (3%)
- Feedback visual adecuado (2%)

### Documentación (5%)
- README claro (2%)
- Código comentado (2%)
- Instrucciones de instalación (1%)

---

## 📚 Recursos de Ayuda {#recursos}

### Documentación Oficial

- **Solidity**: https://docs.soliditylang.org/
- **Foundry**: https://book.getfoundry.sh/
- **Ethers.js v6**: https://docs.ethers.org/v6/
- **Next.js**: https://nextjs.org/docs
- **React Context**: https://react.dev/reference/react/useContext

### Comandos Útiles

```bash
# Smart Contracts
forge build                 # Compilar
forge test -vv             # Tests con logs
forge coverage             # Cobertura
forge clean               # Limpiar cache

# Frontend
npm run dev               # Desarrollo
npm run build             # Build producción
npm run lint              # Linter

# Anvil
anvil                     # Iniciar nodo local
anvil --accounts 20       # Con 20 cuentas
```

### Debugging

**Problema**: Contrato no despliega
```bash
# Verificar Anvil corriendo
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545
```

**Problema**: Frontend no conecta
```bash
# Verificar .env.local
cat dapp/.env.local

# Verificar logs del navegador
# Abrir DevTools > Console
```

**Problema**: Error de firma
```bash
# Verificar mnemonic correcto
# Verificar wallet index válido (0-9)
# Ver logs en consola del navegador
```

### Mejoras Opcionales (Extra Credit)

1. **Drag & Drop** para subir archivos
2. **Exportar lista** de documentos a CSV
3. **Búsqueda/filtrado** en historial
4. **Dark mode** toggle
5. **Animaciones** de transición
6. **Pruebas en testnet** (Sepolia)
7. **IPFS** para almacenar archivo completo
8. **ENS** para nombres legibles
9. **Subgraph** para indexar eventos
10. **PWA** para uso offline

---

## 🎓 Notas Finales

### Tiempo Estimado
- Fase 1 (Smart Contracts): 4-6 horas
- Fase 2 (Frontend): 8-10 horas
- Fase 3 (Integración): 2-3 horas
- Fase 4 (Testing): 2-3 horas
- **Total**: 16-22 horas

### Consejos
1. ✅ Lee toda la tarea antes de empezar
2. ✅ Sigue el orden de las fases
3. ✅ Commitea frecuentemente
4. ✅ Prueba cada función antes de continuar
5. ✅ Usa console.log para debugging
6. ✅ Consulta la documentación oficial
7. ✅ Pregunta si tienes dudas

### ⚠️ Errores Comunes a Evitar

1. ❌ Hardcodear claves privadas en código público
2. ❌ Subir `lib/`, `cache/`, `out/` a git
3. ❌ No validar entrada de usuario
4. ❌ Ignorar manejo de errores
5. ❌ No probar casos edge
6. ❌ UI no responsiva
7. ❌ Commits sin mensaje descriptivo
8. ❌ Código sin comentarios

---

## 🚀 ¡Éxito en tu Proyecto!

Recuerda: Este proyecto te enseña conceptos fundamentales de Web3. Tómate tu tiempo para entender cada parte. ¡Buena suerte! 🎉

---

**Última actualización**: Octubre 2025
**Profesor**: CODECRYPTO
**Curso**: Desarrollo de dApps con Ethereum

   
