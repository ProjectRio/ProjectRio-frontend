// WEBSITE
export const BACKEND = 'https://api.projectrio.app';

export enum STAT_ENDPOINTS {
    CHARACTERS = '/characters/',
    GAMES = '/games/',
    EVENTS = '/events/',
    LANDING_DATA = '/landing_data/',
    STAR_CHANCES = '/star_chances/',
    STATS = '/stats/',
    LIVE_GAMES = '/populate_db/ongoing_game/',
    STATS_FIX = '/stats/fix/',
    LADDER_GAMES = '/ladder/games/',
}

export enum USER_ENDPOINTS {
    SIGNUP = '/signup/',
    REGISTER = '/register/',
    VERIFY_EMAIL = '/verify_email/',
    REQUEST_PASSWORD_CHANGE =  '/request_password_change/',
    CHANGE_PASSWORD = '/change_password/',
    LOGIN = '/login/',
    LOGOUT = '/logout/',
    VALIDATE_JWT = '/validate_jwt/',
    REQUEST_NEW_RIO_KEY = '/request_new_rio_key/',
    SET_PRIVACY = '/set_privacy/',
    USER_TAGS = '/user/tags/',
    USER_COMMUNITY = '/user/community/',
    USER_PRUNE = '/user/prune/',
    USER_ALL = '/user/all',
    USER_COMMUNITY_SPONSOR = '/user/community/sponsor/',
}

export enum COMMUNITY_ENDPOINTS {
    COMMUNITY_CREATE = '/community/create',
    COMMUNITY_JOIN = '/community/join',
    COMMUNITY_INVITE = '/community/invite',
    COMMUNITY_MEMBERS = '/community/members/',
    COMMUNITY_TAGS = '/community/tags/',
    COMMUNITY_MANAGE = '/community/manage/',
    COMMUNITY_SPONSOR = '/community/sponsor',
    COMMUNITY_KEY = '/community/key/',
    COMMUNITY_UPDATE = '/community/update/',
}

// TODO: finish this and others that are 'ADMIN' type endpoints
export enum POPULATE_DB_ENDPOINTS {
    ONGOING_GAME_PRUNE = '/ongoing_game/prune/',
    POPULATE_DB = '/populate_db/',
    MANUAL_SUBMIT_GAME = '/manual_submit_game/',
    UPDATE_GAME_STATUS = '/update_game_status/',
    RECALC_ELO = '/recalc_elo/',

}
export enum UNCATEGORIZED_ENDPOINTS {
    RECREATE_STAT_FILE = '/recreate_stat_file/',
    GET_TAG_SET = '/tag_set/ladder/',
    TAGSET_LIST = '/tag_set/list',
    TAG_LIST = '/tag/list',
    CREATE_TAG_SET = '/tag_set/create',
}

export const GET = async (endpoint: string, param='') => {
    const response = await fetch(BACKEND + endpoint + param)
    const res = await response.json();
    return res
}

export enum USERNAME {
    
}
// USER
export const USERNAME_CHARACTER_LIMIT = 64;
export const PASSWORD_CHARACTER_LIMIT = 500;
export const EMAIL_CHARACTER_LIMIT = 120;

// COMMUNITY
export const COMMUNITY_CHARACTER_LIMIT = 100;
export const COMMUNITY_DESCRIPTION_CHARACTER_LIMIT = 1000;

export const COMMUNITY_TYPES = [
    'Official',
    'Unofficial',
]

export const TAGSET_TYPES = [
    'League',
    'Season',
    'Tournament',
]
// export const 

export const CURRENT_SEASON_OFF = "starsoffseason6"