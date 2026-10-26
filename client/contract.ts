export type EndpointEntriesRemove_OutputNO_CONTENT = void;
export type EndpointTgvFetchTicket_OutputOK =
  | {
      theatre_location: string;
      theatre_number: string;
      theatre_seat: string;
      theatre_showtime: string | null;
      ticket_number: string;
      theatre_location_coords: {
        latitude: number;
        longitude: number;
      } | null;
    }
  | false;
export type EndpointTgvGetExperienceLogos_OutputOK = {
  key: string;
  subject: string;
  logoUrl: string;
}[];
export type EndpointTgvGetMovieCinemas_OutputOK = {
  state: string;
  label: string;
  cinemas: {
    id: string;
    name: string;
  }[];
}[];
export type EndpointTgvGetMovieSessions_OutputOK = {
  sessionid: string;
  screenname: string;
  showtime: string;
  experience: string;
  seatstotal: number;
  seatsused: number;
  usedpercentage: number;
}[];
export type EndpointTgvGetSessionDates_OutputOK = string[];
export type EndpointTgvHasCachedSession_OutputOK = boolean;
export type EndpointTicketClear_OutputNO_CONTENT = void;

export interface Contract {
  entries: {
    count: EndpointEntriesCount;
    create: EndpointEntriesCreate;
    list: EndpointEntriesList;
    remove: EndpointEntriesRemove;
    toggleWatchStatus: EndpointEntriesToggleWatchStatus;
    update: EndpointEntriesUpdate;
  };
  tgv: {
    fetchTicket: EndpointTgvFetchTicket;
    getExperienceLogos: EndpointTgvGetExperienceLogos;
    getMovieCinemas: EndpointTgvGetMovieCinemas;
    getMovieSessions: EndpointTgvGetMovieSessions;
    getSeatPlan: EndpointTgvGetSeatPlan;
    getSessionDates: EndpointTgvGetSessionDates;
    hasCachedSession: EndpointTgvHasCachedSession;
    list: EndpointTgvList;
  };
  ticket: {
    clear: EndpointTicketClear;
    update: EndpointTicketUpdate;
  };
  tmdb: {
    search: EndpointTmdbSearch;
  };
}
export interface EndpointEntriesCount {
  method: "get";
  input: {};
  output: {
    OK: EndpointEntriesCount_OutputOK;
  };
  media: null;
}
export interface EndpointEntriesCount_OutputOK {
  watched: number;
  unwatched: number;
}
export interface EndpointEntriesCreate {
  method: "post";
  input: {
    query?: EndpointEntriesCreate_InputQuery;
    body?: EndpointEntriesCreate_InputBody;
  };
  output: {
    CREATED: EndpointEntriesCreate_OutputCREATED;
  };
  media: null;
}
export interface EndpointEntriesCreate_InputQuery {
  id: string;
}
export interface EndpointEntriesCreate_InputBody {
  tgvId?: string;
}
export interface EndpointEntriesCreate_OutputCREATED {
  id: string;
  tmdb_id: number;
  tgv_id: string;
  title: string;
  original_title: string;
  poster: string;
  genres: string[];
  duration: number;
  overview: string;
  language: string;
  release_date: string;
  watch_date: string | null;
  ticket_number: string;
  theatre_seat: string;
  theatre_showtime: string | null;
  theatre_location: string;
  theatre_location_coords: {
    lat: number;
    lon: number;
  } | null;
  theatre_number: string;
  is_watched: boolean;
}
export interface EndpointEntriesList {
  method: "get";
  input: {
    query?: EndpointEntriesList_InputQuery;
  };
  output: {
    OK: EndpointEntriesList_OutputOK;
  };
  media: null;
}
export interface EndpointEntriesList_InputQuery {
  watched?: "true" | "false";
}
export interface EndpointEntriesList_OutputOK {
  total: number;
  entries: {
    id: string;
    tmdb_id: number;
    tgv_id: string;
    title: string;
    original_title: string;
    poster: string;
    genres: string[];
    duration: number;
    overview: string;
    language: string;
    release_date: string;
    watch_date: string | null;
    ticket_number: string;
    theatre_seat: string;
    theatre_showtime: string | null;
    theatre_location: string;
    theatre_location_coords: {
      lat: number;
      lon: number;
    } | null;
    theatre_number: string;
    is_watched: boolean;
  }[];
}
export interface EndpointEntriesRemove {
  method: "post";
  input: {
    query?: EndpointEntriesRemove_InputQuery;
  };
  output: {
    NO_CONTENT: EndpointEntriesRemove_OutputNO_CONTENT;
  };
  media: null;
}
export interface EndpointEntriesRemove_InputQuery {
  id: string;
}
export interface EndpointEntriesToggleWatchStatus {
  method: "post";
  input: {
    query?: EndpointEntriesToggleWatchStatus_InputQuery;
  };
  output: {
    OK: EndpointEntriesToggleWatchStatus_OutputOK;
  };
  media: null;
}
export interface EndpointEntriesToggleWatchStatus_InputQuery {
  id: string;
}
export interface EndpointEntriesToggleWatchStatus_OutputOK {
  id: string;
  tmdb_id: number;
  tgv_id: string;
  title: string;
  original_title: string;
  poster: string;
  genres: string[];
  duration: number;
  overview: string;
  language: string;
  release_date: string;
  watch_date: string | null;
  ticket_number: string;
  theatre_seat: string;
  theatre_showtime: string | null;
  theatre_location: string;
  theatre_location_coords: {
    lat: number;
    lon: number;
  } | null;
  theatre_number: string;
  is_watched: boolean;
}
export interface EndpointEntriesUpdate {
  method: "post";
  input: {
    query?: EndpointEntriesUpdate_InputQuery;
  };
  output: {
    OK: EndpointEntriesUpdate_OutputOK;
  };
  media: null;
}
export interface EndpointEntriesUpdate_InputQuery {
  id: string;
}
export interface EndpointEntriesUpdate_OutputOK {
  id: string;
  tmdb_id: number;
  tgv_id: string;
  title: string;
  original_title: string;
  poster: string;
  genres: string[];
  duration: number;
  overview: string;
  language: string;
  release_date: string;
  watch_date: string | null;
  ticket_number: string;
  theatre_seat: string;
  theatre_showtime: string | null;
  theatre_location: string;
  theatre_location_coords: {
    lat: number;
    lon: number;
  } | null;
  theatre_number: string;
  is_watched: boolean;
}
export interface EndpointTgvFetchTicket {
  method: "post";
  input: {
    body?: EndpointTgvFetchTicket_InputBody;
  };
  output: {
    OK: EndpointTgvFetchTicket_OutputOK;
  };
  media: null;
}
export interface EndpointTgvFetchTicket_InputBody {
  email?: string;
  pin?: string;
  tgvId: string;
}
export interface EndpointTgvGetExperienceLogos {
  method: "get";
  input: {};
  output: {
    OK: EndpointTgvGetExperienceLogos_OutputOK;
  };
  media: null;
}
export interface EndpointTgvGetMovieCinemas {
  method: "get";
  input: {
    query?: EndpointTgvGetMovieCinemas_InputQuery;
  };
  output: {
    OK: EndpointTgvGetMovieCinemas_OutputOK;
  };
  media: null;
}
export interface EndpointTgvGetMovieCinemas_InputQuery {
  movieId: string;
  businessDate: string;
}
export interface EndpointTgvGetMovieSessions {
  method: "get";
  input: {
    query?: EndpointTgvGetMovieSessions_InputQuery;
  };
  output: {
    OK: EndpointTgvGetMovieSessions_OutputOK;
  };
  media: null;
}
export interface EndpointTgvGetMovieSessions_InputQuery {
  cinemaId: string;
  businessDate: string;
  movieId: string;
}
export interface EndpointTgvGetSeatPlan {
  method: "get";
  input: {
    query?: EndpointTgvGetSeatPlan_InputQuery;
  };
  output: {
    OK: EndpointTgvGetSeatPlan_OutputOK;
  };
  media: null;
}
export interface EndpointTgvGetSeatPlan_InputQuery {
  sessionId: string;
  cinemaId: string;
}
export interface EndpointTgvGetSeatPlan_OutputOK {
  areas: {
    rows: {
      physicalName: string;
      seats: {
        columnIndex: number;
        status: number;
        seatsInGroup:
          | {
              areaNumber: number;
              rowIndex: number;
              columnIndex: number;
            }[]
          | null;
      }[];
    }[];
  }[];
  screenStart: number;
  screenWidth: number;
  boundaryRight: number;
  boundaryLeft: number;
  boundaryTop: number;
}
export interface EndpointTgvGetSessionDates {
  method: "get";
  input: {
    query?: EndpointTgvGetSessionDates_InputQuery;
  };
  output: {
    OK: EndpointTgvGetSessionDates_OutputOK;
  };
  media: null;
}
export interface EndpointTgvGetSessionDates_InputQuery {
  movieId: string;
}
export interface EndpointTgvHasCachedSession {
  method: "get";
  input: {};
  output: {
    OK: EndpointTgvHasCachedSession_OutputOK;
  };
  media: null;
}
export interface EndpointTgvList {
  method: "get";
  input: {
    query?: EndpointTgvList_InputQuery;
  };
  output: {
    OK: EndpointTgvList_OutputOK;
  };
  media: null;
}
export interface EndpointTgvList_InputQuery {
  type: "nowShowing" | "comingSoon";
}
export interface EndpointTgvList_OutputOK {
  movies: {
    itemkey: string;
    recid: string;
    name: string;
    poster: string;
    genres: string[];
    duration: number;
    overview: string;
    language: string;
    release_date: string;
  }[];
}
export interface EndpointTicketClear {
  method: "post";
  input: {
    query?: EndpointTicketClear_InputQuery;
  };
  output: {
    NO_CONTENT: EndpointTicketClear_OutputNO_CONTENT;
  };
  media: null;
}
export interface EndpointTicketClear_InputQuery {
  id: string;
}
export interface EndpointTicketUpdate {
  method: "post";
  input: {
    query?: EndpointTicketUpdate_InputQuery;
    body?: EndpointTicketUpdate_InputBody;
  };
  output: {
    OK: EndpointTicketUpdate_OutputOK;
  };
  media: null;
}
export interface EndpointTicketUpdate_InputQuery {
  id: string;
}
export interface EndpointTicketUpdate_InputBody {
  ticket_number: string;
  theatre_number: string;
  theatre_seat: string;
  theatre_showtime?: string;
  theatre_location?: {
    name: string;
    formattedAddress: string;
    location: {
      latitude: number;
      longitude: number;
    };
  };
}
export interface EndpointTicketUpdate_OutputOK {
  id: string;
  tmdb_id: number;
  tgv_id: string;
  title: string;
  original_title: string;
  poster: string;
  genres: string[];
  duration: number;
  overview: string;
  language: string;
  release_date: string;
  watch_date: string | null;
  ticket_number: string;
  theatre_seat: string;
  theatre_showtime: string | null;
  theatre_location: string;
  theatre_location_coords: {
    lat: number;
    lon: number;
  } | null;
  theatre_number: string;
  is_watched: boolean;
}
export interface EndpointTmdbSearch {
  method: "get";
  input: {
    query?: EndpointTmdbSearch_InputQuery;
  };
  output: {
    OK: EndpointTmdbSearch_OutputOK;
  };
  media: null;
}
export interface EndpointTmdbSearch_InputQuery {
  q: string;
  page: string;
}
export interface EndpointTmdbSearch_OutputOK {
  page: number;
  results: {
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    existed: boolean;
    id: number;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
  }[];
  total_pages: number;
  total_results: number;
}
