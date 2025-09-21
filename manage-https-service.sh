#!/bin/bash

# Script to manage the TDI Service HTTPS service
# Usage: ./manage-https-service.sh [start|stop|restart|status|install|uninstall]

ACTION=${1:-status}

case $ACTION in
    start)
        echo "Starting TDI Service HTTPS service..."
        systemctl start tdi-employee-https
        systemctl status tdi-employee-https --no-pager
        ;;
    stop)
        echo "Stopping TDI Service HTTPS service..."
        systemctl stop tdi-employee-https
        ;;
    restart)
        echo "Restarting TDI Service HTTPS service..."
        systemctl restart tdi-employee-https
        systemctl status tdi-employee-https --no-pager
        ;;
    status)
        echo "TDI Service HTTPS service status:"
        systemctl status tdi-employee-https --no-pager
        ;;
    install)
        echo "Installing TDI Service HTTPS service..."
        # Copy service file to systemd directory
        cp /root/app/tdi-main-app-employee/tdi-employee-https.service /etc/systemd/system/
        
        # Reload systemd daemon
        systemctl daemon-reload
        
        # Enable the service to start on boot
        systemctl enable tdi-employee-https
        
        # Start the service
        systemctl start tdi-employee-https
        
        echo "Service installed and started successfully!"
        echo "Service status:"
        systemctl status tdi-employee-https --no-pager
        ;;
    uninstall)
        echo "Uninstalling TDI Service HTTPS service..."
        # Stop the service
        systemctl stop tdi-employee-https
        
        # Disable the service
        systemctl disable tdi-employee-https
        
        # Remove service file
        rm -f /etc/systemd/system/tdi-employee-https.service
        
        # Reload systemd daemon
        systemctl daemon-reload
        
        echo "Service uninstalled successfully!"
        ;;
    logs)
        echo "Viewing service logs (last 50 lines):"
        journalctl -u tdi-employee-https -n 50 --no-pager
        ;;
    follow)
        echo "Following service logs (Ctrl+C to exit):"
        journalctl -u tdi-employee-https -f
        ;;
    *)
        echo "Usage: $0 [start|stop|restart|status|install|uninstall|logs|follow]"
        echo ""
        echo "Commands:"
        echo "  start     - Start the service"
        echo "  stop      - Stop the service"
        echo "  restart   - Restart the service"
        echo "  status    - Show service status"
        echo "  install   - Install and start the service"
        echo "  uninstall - Stop and remove the service"
        echo "  logs      - Show recent service logs"
        echo "  follow    - Follow service logs in real-time"
        ;;
esac