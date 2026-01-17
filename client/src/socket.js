import Pusher from 'pusher-js';

// Get Pusher config from env
const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY || 'your_pusher_key';
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || 'mt1';

const pusher = new Pusher(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER,
    forceTLS: true
});

/**
 * Unified way to listen to events
 * @param {string} channelName - e.g. user-123 or job-456
 * @param {string} eventName - e.g. job_update
 * @param {function} callback 
 */
export const subscribeToEvent = (channelName, eventName, callback) => {
    const channel = pusher.subscribe(channelName);
    channel.bind(eventName, callback);

    return () => {
        channel.unbind(eventName, callback);
        pusher.unsubscribe(channelName);
    };
};

export default pusher;
