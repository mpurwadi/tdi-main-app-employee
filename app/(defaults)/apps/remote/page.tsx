import RemoteCheckin from '@/components/apps/remote/components-apps-remote';
import { getTranslation } from '@/i18n';

const RemotePage = async () => {
    const { t } = await getTranslation();
    
    return (
        <div>
            <RemoteCheckin />
        </div>
    );
};

export default RemotePage;