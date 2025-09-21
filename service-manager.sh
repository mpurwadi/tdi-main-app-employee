#!/bin/bash

# TDI Employee App Service Management Script

case "$1" in
    start)
        sudo systemctl start tdi-employee.service
        echo "TDI Employee service started"
        ;;
    stop)
        sudo systemctl stop tdi-employee.service
        echo "TDI Employee service stopped"
        ;;
    restart)
        sudo systemctl restart tdi-employee.service
        echo "TDI Employee service restarted"
        ;;
    status)
        sudo systemctl status tdi-employee.service
        ;;
    logs)
        sudo journalctl -u tdi-employee.service -f
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac