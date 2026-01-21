import { useAuth } from '../context/AuthContext';

const UserAvatar = ({ size = 40, user: propUser, style = {} }) => {
    const { user: contextUser } = useAuth();
    const user = propUser || contextUser;

    if (!user) return null;

    const baseStyle = {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: size > 100 ? '24px' : '14px', // Modern squircle for smaller avatars
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: `${size * 0.4}px`,
        overflow: 'hidden',
        flexShrink: 0,
        ...style
    };

    if (user.profilePhoto) {
        return (
            <img
                src={user.profilePhoto}
                alt={user.name}
                style={{
                    ...baseStyle,
                    objectFit: 'cover',
                    border: '1px solid rgba(0,0,0,0.05)'
                }}
            />
        );
    }

    return (
        <div style={{
            ...baseStyle,
            background: 'var(--text)',
            color: 'var(--bg)',
            textTransform: 'uppercase',
            letterSpacing: '-0.02em'
        }}>
            {user.name?.charAt(0)}
        </div>
    );
};

export default UserAvatar;
