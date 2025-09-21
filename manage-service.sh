#!/bin/bash

# Script to manage the TDI Service

case "$1" in
    start)
        sudo systemctl start tdi-employee.service
        ;;
    stop)
        sudo systemctl stop tdi-employee.service
        ;;
    restart)
        sudo systemctl restart tdi-employee.service
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