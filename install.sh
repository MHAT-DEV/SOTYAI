#!/bin/bash
# SOTYAI HAKP Network - Multi-language One-Click Installer
# This script installs and configures the SOTYAI Network using Docker Compose.

set -e

# Terminal Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Language selection
INSTALL_LANG="en"
echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}    SOTYAI Human-AI Knowledge Platform (HAKP) Network       ${NC}"
echo -e "${CYAN}               One-Click Installation Script                ${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""
echo "Select Installation Language / เลือกภาษาในการติดตั้ง:"
echo "1) English (default)"
echo "2) ภาษาไทย (Thai)"
echo ""
read -p "Please select (1-2) [default: 1]: " LANG_CHOICE

if [ "$LANG_CHOICE" = "2" ]; then
    INSTALL_LANG="th"
fi

# Localization dictionary
declare -A msg_welcome
declare -A msg_checking_docker
declare -A msg_docker_err
declare -A msg_docker_ok
declare -A msg_checking_ports
declare -A msg_port_warn
declare -A msg_fallback_port
declare -A msg_ports_ok
declare -A msg_setup_env
declare -A msg_env_created
declare -A msg_env_warn
declare -A msg_env_exists
declare -A msg_starting_containers
declare -A msg_complete
declare -A msg_complete_desc
declare -A msg_view_logs
declare -A msg_stop_cmd
declare -A msg_env_key_warn

# English translations
msg_welcome[en]="Starting installation of SOTYAI HAKP Network..."
msg_checking_docker[en]="🔍 Checking Docker & Docker Compose..."
msg_docker_err[en]="❌ Error: Docker or Docker Compose (V2) is not installed. Please install Docker first."
msg_docker_ok[en]="✅ Docker and Docker Compose are installed."
msg_checking_ports[en]="🔍 Checking port availability..."
msg_port_warn[en]="⚠️  Warning: Port %s is already in use (possibly by an existing Nginx or Apache server)."
msg_fallback_port[en]="🔄 Falling back to alternative port: %s"
msg_ports_ok[en]="✅ Ports configured successfully:"
msg_setup_env[en]="⚙️  Setting up environment configuration..."
msg_env_created[en]="✅ Created .env from .env.example"
msg_env_warn[en]="⚠️  Please remember to update your Gemini API Key and secrets in the .env file later."
msg_env_exists[en]="ℹ️  .env file already exists. Skipping creation."
msg_starting_containers[en]="🚀 Starting SOTYAI Network containers via Docker Compose..."
msg_complete[en]="============================================================\n✅ SOTYAI Network Installation Complete!\n============================================================"
msg_complete_desc[en]="Your SOTYAI HAKP Network is starting up in the background."
msg_view_logs[en]="To view logs: docker compose logs -f"
msg_stop_cmd[en]="To stop: docker compose down"
msg_env_key_warn[en]="Please update your .env file with your actual GEMINI_API_KEY and other credentials."

# Thai translations
msg_welcome[th]="กำลังเริ่มการติดตั้งเครือข่าย SOTYAI HAKP..."
msg_checking_docker[th]="🔍 กำลังตรวจสอบ Docker & Docker Compose..."
msg_docker_err[th]="❌ ข้อผิดพลาด: ไม่พบ Docker หรือ Docker Compose (V2) กรุณาติดตั้ง Docker ก่อนใช้งาน"
msg_docker_ok[th]="✅ Docker และ Docker Compose พร้อมใช้งานแล้ว"
msg_checking_ports[th]="🔍 กำลังตรวจสอบพอร์ตที่เปิดใช้งาน..."
msg_port_warn[th]="⚠️  คำเตือน: พอร์ต %s ถูกใช้งานอยู่แล้ว (อาจเปิดใช้งานด้วย Nginx หรือ Apache อื่น)"
msg_fallback_port[th]="🔄 กำลังสลับไปใช้พอร์ตทางเลือก: %s"
msg_ports_ok[th]="✅ กำหนดค่าพอร์ตเรียบร้อยแล้ว:"
msg_setup_env[th]="⚙️  กำลังตั้งค่าไฟล์สภาพแวดล้อม (.env)..."
msg_env_created[th]="✅ สร้างไฟล์ .env เรียบร้อยแล้วจาก .env.example"
msg_env_warn[th]="⚠️  อย่าลืมอัปเดตไฟล์ .env ด้วยข้อมูลคีย์และการเชื่อมต่อจริงของคุณภายหลัง"
msg_env_exists[th]="ℹ️  ไฟล์ .env มีอยู่แล้ว ข้ามขั้นตอนนี้"
msg_starting_containers[th]="🚀 กำลังเริ่มรัน SOTYAI Network คอนเทนเนอร์ด้วย Docker Compose..."
msg_complete[th]="============================================================\n✅ การติดตั้ง SOTYAI Network เสร็จสมบูรณ์แล้ว!\n============================================================"
msg_complete_desc[th]="ระบบ SOTYAI HAKP Network ของคุณกำลังเริ่มทำงานในพื้นหลัง"
msg_view_logs[th]="ดู Log การทำงาน: docker compose logs -f"
msg_stop_cmd[th]="หยุดการทำงาน: docker compose down"
msg_env_key_warn[th]="กรุณาอัปเดตไฟล์ .env ด้วยคีย์ GEMINI_API_KEY และข้อมูลประจำตัวจริงของคุณเพื่อเปิดใช้งานฟีเจอร์ AI"

# Print welcome message
echo -e "${GREEN}${msg_welcome[$INSTALL_LANG]}${NC}"
echo ""

# 1. Check Docker & Docker Compose
echo -e "${YELLOW}${msg_checking_docker[$INSTALL_LANG]}${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}${msg_docker_err[$INSTALL_LANG]}${NC}"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo -e "${RED}${msg_docker_err[$INSTALL_LANG]}${NC}"
    exit 1
fi
echo -e "${GREEN}${msg_docker_ok[$INSTALL_LANG]}${NC}"
echo ""

# 2. Check Port Availability function
check_port() {
    local port=$1
    if command -v lsof &> /dev/null; then
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            return 1 # Port in use
        else
            return 0 # Port available
        fi
    elif command -v ss &> /dev/null; then
        if ss -tlnp | grep -q ":$port " >/dev/null 2>&1; then
            return 1
        else
            return 0
        fi
    elif command -v netstat &> /dev/null; then
        if netstat -tln | grep -q ":$port " >/dev/null 2>&1; then
            return 1
        else
            return 0
        fi
    else
        # Fallback using bash socket if available
        (echo > /dev/tcp/127.0.0.1/$port) >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            return 1 # Connected, so port in use
        else
            return 0 # Connection refused, port likely free
        fi
    fi
}

echo -e "${YELLOW}${msg_checking_ports[$INSTALL_LANG]}${NC}"
HTTP_PORT=80
HTTPS_PORT=443

if ! check_port $HTTP_PORT; then
    warn_msg=$(printf "${msg_port_warn[$INSTALL_LANG]}" "$HTTP_PORT")
    echo -e "${YELLOW}$warn_msg${NC}"
    HTTP_PORT=8080
    fallback_msg=$(printf "${msg_fallback_port[$INSTALL_LANG]}" "$HTTP_PORT")
    echo -e "${CYAN}$fallback_msg${NC}"
    while ! check_port $HTTP_PORT; do
        HTTP_PORT=$((HTTP_PORT + 1))
        fallback_msg=$(printf "${msg_fallback_port[$INSTALL_LANG]}" "$HTTP_PORT")
        echo -e "${CYAN}$fallback_msg${NC}"
    done
fi

if ! check_port $HTTPS_PORT; then
    warn_msg=$(printf "${msg_port_warn[$INSTALL_LANG]}" "$HTTPS_PORT")
    echo -e "${YELLOW}$warn_msg${NC}"
    HTTPS_PORT=8443
    fallback_msg=$(printf "${msg_fallback_port[$INSTALL_LANG]}" "$HTTPS_PORT")
    echo -e "${CYAN}$fallback_msg${NC}"
    while ! check_port $HTTPS_PORT; do
        HTTPS_PORT=$((HTTPS_PORT + 1))
        fallback_msg=$(printf "${msg_fallback_port[$INSTALL_LANG]}" "$HTTPS_PORT")
        echo -e "${CYAN}$fallback_msg${NC}"
    done
fi

echo -e "${GREEN}${msg_ports_ok[$INSTALL_LANG]}${NC}"
echo -e "  - HTTP Port: ${CYAN}$HTTP_PORT${NC}"
echo -e "  - HTTPS Port: ${CYAN}$HTTPS_PORT${NC}"
echo ""

# 3. Setup Environment Variables
echo -e "${YELLOW}${msg_setup_env[$INSTALL_LANG]}${NC}"
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}${msg_env_created[$INSTALL_LANG]}${NC}"
        echo -e "${YELLOW}${msg_env_warn[$INSTALL_LANG]}${NC}"
    else
        echo -e "${RED}❌ Error: .env.example not found!${NC}"
        exit 1
    fi
else
    echo -e "${CYAN}${msg_env_exists[$INSTALL_LANG]}${NC}"
fi

# Append or update ports in .env (handling different sed flavors across Linux and macOS)
if grep -q "HTTP_PORT=" .env; then
    sed -i.bak "s/^HTTP_PORT=.*/HTTP_PORT=$HTTP_PORT/" .env && rm -f .env.bak
else
    echo "HTTP_PORT=$HTTP_PORT" >> .env
fi

if grep -q "HTTPS_PORT=" .env; then
    sed -i.bak "s/^HTTPS_PORT=.*/HTTPS_PORT=$HTTPS_PORT/" .env && rm -f .env.bak
else
    echo "HTTPS_PORT=$HTTPS_PORT" >> .env
fi

# Export ports so Docker Compose can pick them up
export HTTP_PORT=$HTTP_PORT
export HTTPS_PORT=$HTTPS_PORT

# 4. Starting the containers
echo ""
echo -e "${YELLOW}${msg_starting_containers[$INSTALL_LANG]}${NC}"
if [ -f docker-compose.prod.yml ]; then
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
else
    docker compose up -d --build
fi

echo ""
echo -e "${GREEN}${msg_complete[$INSTALL_LANG]}${NC}"
echo -e "${CYAN}${msg_complete_desc[$INSTALL_LANG]}${NC}"
echo ""
echo -e "👉 ${YELLOW}${msg_view_logs[$INSTALL_LANG]}${NC}"
echo -e "👉 ${YELLOW}${msg_stop_cmd[$INSTALL_LANG]}${NC}"
echo ""
echo -e "⚠️  ${RED}${msg_env_key_warn[$INSTALL_LANG]}${NC}"
echo -e "${CYAN}============================================================${NC}"
