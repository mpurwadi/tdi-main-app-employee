// services/notificationService.ts
export interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    read: boolean;
    userId: number;
}

export async function fetchNotifications(userId: number): Promise<Notification[]> {
    try {
        // In a real implementation, this would call your API endpoint
        // const response = await fetch(`/api/notifications?userId=${userId}`);
        // const data = await response.json();
        // return data.notifications;
        
        // Mock data for now
        return [
            {
                id: 1,
                title: 'Welcome',
                message: 'Welcome to the TDI Service system!',
                time: '2023-05-01T08:30:00Z',
                read: false,
                userId: userId
            },
            {
                id: 2,
                title: 'System Update',
                message: 'The system will be updated tonight at 2 AM.',
                time: '2023-05-02T14:15:00Z',
                read: true,
                userId: userId
            }
        ];
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return [];
    }
}

export async function markNotificationAsRead(notificationId: number): Promise<boolean> {
    try {
        // In a real implementation, this would call your API endpoint
        // const response = await fetch(`/api/notifications/${notificationId}/read`, {
        //     method: 'POST'
        // });
        // return response.ok;
        
        // Mock implementation
        return true;
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
        return false;
    }
}