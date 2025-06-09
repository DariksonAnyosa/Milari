#!/bin/bash

echo "🔍 MILARI IA - Configuración de Red"
echo "=================================="
echo ""

# Obtener la IP local
echo "📡 Tu dirección IP local es:"
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1

echo ""
echo "📱 Para acceder desde tu celular:"
echo "   http://$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1):3000"
echo ""
echo "🌐 Asegúrate de que ambos dispositivos estén en la misma WiFi"
echo "📋 Copia la URL completa en Safari de tu iPhone"
