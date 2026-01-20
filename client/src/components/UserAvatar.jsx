import { useAuth } from '../context/AuthContext';

const UserAvatar = ({ size = 40, fontSize = '1rem', user: propUser, style = {} }) => {
    const { user: contextUser } = useAuth();
    const user = propUser || contextUser;

    if (!user) return null;

    const avatarStyle = {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 900,
        color: 'white',
        ...style
    };

    if (user.profilePhoto) {
        return (
            <img
                src={user.profilePhoto}
                alt={user.name}
                style={{
                    ...avatarStyle,
                    objectFit: 'cover',
                    border: '2px solid #3b82f6'
                }}
            />
        );
    }

    return (
        <div style={{
            ...avatarStyle,
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            fontSize
        }}>
            {user.name?.charAt(0).toUpperCase()}
        </div>
    );
};

export default UserAvatar;
