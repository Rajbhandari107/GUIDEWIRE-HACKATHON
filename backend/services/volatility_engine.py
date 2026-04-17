from typing import Tuple

def get_time_multiplier(hour: int) -> Tuple[float, str]:
    """
    Returns the payout multiplier and the name of the time band based on the hour.
    
    6 AM – 10 AM   Morning Rush   = 1.3x
    10 AM – 4 PM   Off Peak       = 0.8x
    4 PM – 10 PM   Prime Rush     = 1.6x
    10 PM – 1 AM   Late Peak      = 1.2x
    1 AM – 6 AM    Low Activity   = 0.6x
    """
    if 6 <= hour < 10:
        return 1.3, "Morning Rush"
    elif 10 <= hour < 16:
        return 0.8, "Off Peak"
    elif 16 <= hour < 22:
        return 1.6, "Prime Rush"
    elif 22 <= hour or hour < 1:
        return 1.2, "Late Peak"
    else:
        return 0.6, "Low Activity"
