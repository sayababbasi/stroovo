import prisma from './prisma';

export const createNotification = async ({
    userId,
    tenantId,
    type = 'INFO',
    title,
    message,
    link
}: {
    userId: string;
    tenantId: string;
    type?: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
    title: string;
    message: string;
    link?: string;
}) => {
    try {
        return await prisma.notification.create({
            data: {
                userId,
                tenantId,
                type,
                title,
                message,
                link,
            }
        });
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
};

export const markAsRead = async (notificationId: string) => {
    return await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
    });
};
