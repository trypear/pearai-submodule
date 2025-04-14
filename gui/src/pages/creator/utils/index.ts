export const getAnimationDirection = () => {
    if (typeof window === 'undefined') return null;
    // If it's been more than 1 second since the last animation update,
    // assume we're in a stable state based on the last known direction
    const now = Date.now();
    const timeSinceUpdate = now - window.__creatorOverlayAnimation.timestamp;

    if (timeSinceUpdate > 1000) {
        // If last direction was "up", we should be hidden (-100%)
        // If last direction was "down", we should be visible (0)
        // If no direction yet, default null
        return window.__creatorOverlayAnimation.direction;
    }

    // We're in an active animation, return the current direction
    return window.__creatorOverlayAnimation.direction;
};

export const setAnimationDirection = (direction: "up" | "down") => {
    if (typeof window === 'undefined') return;
    window.__creatorOverlayAnimation = {
        direction,
        timestamp: Date.now()
    };
};