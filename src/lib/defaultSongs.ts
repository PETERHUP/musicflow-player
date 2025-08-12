import { Playlist, Song } from './types';

export const createDefaultSong = (
  id: string,
  title: string,
  artist: string,
  videoId: string,
  startTime: number = 0
): Song => ({
  id,
  title: `${title} - ${artist}`,
  url: `https://www.youtube.com/watch?v=${videoId}`,
  startTime,
  thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
});

export const defaultPlaylists: Playlist[] = [
  {
    id: 'goal',
    name: 'Goal',
    image: '🥅',
    playedSongs: [],
    songs: [
      createDefaultSong('goal-1', 'We Are The Champions', 'Queen', 'rY0WxgSXdEE', 10),
      createDefaultSong('goal-2', 'Don\'t Stop Believin\'', 'Journey', '1k8craCGpgs', 5),
      createDefaultSong('goal-3', 'Eye of the Tiger', 'Survivor', 'btPJPFnesV4', 8),
      createDefaultSong('goal-4', 'We Will Rock You', 'Queen', '-tJYN-eG1zk', 0),
      createDefaultSong('goal-5', 'Celebration', 'Kool & The Gang', 'roRQ2mNwMMQ', 0),
      createDefaultSong('goal-6', 'All Star', 'Smash Mouth', 'L_jWHffIx5E', 15),
      createDefaultSong('goal-7', 'Rock and Roll All Nite', 'KISS', 'qhR7KmPUnJo', 0),
      createDefaultSong('goal-8', 'Born to Be Wild', 'Steppenwolf', 'rMbATaj7Il8', 0),
      createDefaultSong('goal-9', 'Good as Hell', 'Lizzo', 'SmbmeOgWsqE', 20),
      createDefaultSong('goal-10', 'Uptown Funk', 'Mark Ronson ft. Bruno Mars', 'OPf0YbXqDm0', 0)
    ]
  },
  {
    id: 'penalty',
    name: 'Penalty',
    image: '⚠️',
    playedSongs: [],
    songs: [
      createDefaultSong('penalty-1', 'Bad Boys', 'Inner Circle', '1VRZq3J0uz4', 5),
      createDefaultSong('penalty-2', 'Another One Bites the Dust', 'Queen', 'rY0WxgSXdEE', 0),
      createDefaultSong('penalty-3', 'For What It\'s Worth', 'Buffalo Springfield', 'gp5JCrSXkJY', 0),
      createDefaultSong('penalty-4', 'Jailhouse Rock', 'Elvis Presley', 'gj0Rz-uP4Mk', 0),
      createDefaultSong('penalty-5', 'I Fought the Law', 'The Clash', 'OgtQj8O92eI', 0),
      createDefaultSong('penalty-6', 'Bad to the Bone', 'George Thorogood', 'IyhJ69mD7xI', 0),
      createDefaultSong('penalty-7', 'Guilty', 'Gravity Kills', 'xz0vhJYdKOE', 0),
      createDefaultSong('penalty-8', 'Criminal', 'Fiona Apple', 'FFOzayDpWoI', 0),
      createDefaultSong('penalty-9', 'Prisoner', 'The Weeknd', 'VJJwhVCzkJQ', 0),
      createDefaultSong('penalty-10', 'Bad Company', 'Bad Company', '5Nq2aBNKO6k', 0)
    ]
  },
  {
    id: 'powerplay',
    name: 'Power Play',
    image: '⚡',
    playedSongs: [],
    songs: [
      createDefaultSong('powerplay-1', 'Thunderstruck', 'AC/DC', 'v2AC41dglnM', 0),
      createDefaultSong('powerplay-2', 'Power', 'Kanye West', 'L53gjP-TtGE', 0),
      createDefaultSong('powerplay-3', 'Eye of the Tiger', 'Survivor', 'btPJPFnesV4', 0),
      createDefaultSong('powerplay-4', 'Living After Midnight', 'Judas Priest', 'YTWr2hBtnAE', 0),
      createDefaultSong('powerplay-5', 'Let\'s Go', 'Calvin Harris', 'YXwYJyrKK5A', 0),
      createDefaultSong('powerplay-6', 'Pump It', 'Black Eyed Peas', 'ZaI2IlHwmgQ', 0),
      createDefaultSong('powerplay-7', 'Till I Collapse', 'Eminem', 'ytQ5CYE1VZw', 0),
      createDefaultSong('powerplay-8', 'Remember the Name', 'Fort Minor', 'VDvr08sCPOc', 0),
      createDefaultSong('powerplay-9', 'Can\'t Hold Us', 'Macklemore', 'xHRkHdpWQZU', 0),
      createDefaultSong('powerplay-10', 'Levels', 'Avicii', '_ovdm2yX4MA', 0)
    ]
  },
  {
    id: 'intermission',
    name: 'Intermission',
    image: '☕',
    playedSongs: [],
    songs: [
      createDefaultSong('intermission-1', 'Sweet Caroline', 'Neil Diamond', '1vhFnTjia_I', 60),
      createDefaultSong('intermission-2', 'Build Me Up Buttercup', 'The Foundations', 'iol0B-clFFM', 0),
      createDefaultSong('intermission-3', 'Piano Man', 'Billy Joel', 'gxEPV4kolz0', 0),
      createDefaultSong('intermission-4', 'Don\'t Stop Me Now', 'Queen', 'HgzGwKwLmgM', 0),
      createDefaultSong('intermission-5', 'Mr. Blue Sky', 'Electric Light Orchestra', 'wuJIqmha2Hc', 0),
      createDefaultSong('intermission-6', 'September', 'Earth Wind & Fire', 'Gs069dndIYk', 0),
      createDefaultSong('intermission-7', 'Good Vibrations', 'The Beach Boys', 'Eab_beh07HU', 0),
      createDefaultSong('intermission-8', 'Lovely Day', 'Bill Withers', 'bEeaS6fuUoA', 0),
      createDefaultSong('intermission-9', 'Walking on Sunshine', 'Katrina and the Waves', 'iPUmE-tne5U', 0),
      createDefaultSong('intermission-10', 'Happy', 'Pharrell Williams', 'ZbZSe6N_BXs', 0)
    ]
  },
  {
    id: 'warmup',
    name: 'Warm Up',
    image: '🔥',
    playedSongs: [],
    songs: [
      createDefaultSong('warmup-1', 'Pump It Up', 'Elvis Costello', 'H0qZDIb-vJM', 0),
      createDefaultSong('warmup-2', 'Stronger', 'Kanye West', 'PsO6ZnUZI0g', 0),
      createDefaultSong('warmup-3', 'Lose Yourself', 'Eminem', '_Yhyp-_hX2s', 0),
      createDefaultSong('warmup-4', 'Work Out', 'J. Cole', 'pNvU9ZjNnGY', 0),
      createDefaultSong('warmup-5', 'Can\'t Stop the Feeling!', 'Justin Timberlake', 'ru0K8uYEZWw', 0),
      createDefaultSong('warmup-6', 'Uptown Funk', 'Mark Ronson ft. Bruno Mars', 'OPf0YbXqDm0', 0),
      createDefaultSong('warmup-7', 'High Hopes', 'Panic! At The Disco', 'IPXIgEAGe_U', 0),
      createDefaultSong('warmup-8', 'Believer', 'Imagine Dragons', '7wtfhZwyrcc', 0),
      createDefaultSong('warmup-9', 'Shut Up and Dance', 'Walk the Moon', 'po_EBsBQ1mQ', 0),
      createDefaultSong('warmup-10', 'Feel It Still', 'Portugal. The Man', 'pBkHHoOIIn8', 0)
    ]
  },
  {
    id: 'pregame',
    name: 'Pre-Game',
    image: '🏒',
    playedSongs: [],
    songs: [
      createDefaultSong('pregame-1', 'We Will Rock You', 'Queen', '-tJYN-eG1zk', 0),
      createDefaultSong('pregame-2', 'Welcome to the Jungle', 'Guns N\' Roses', 'o1tj2zJ2Wvg', 0),
      createDefaultSong('pregame-3', 'Pour Some Sugar On Me', 'Def Leppard', '0UIB9Y4OFPs', 0),
      createDefaultSong('pregame-4', 'Living on a Prayer', 'Bon Jovi', 'lDK9QqIzhwk', 0),
      createDefaultSong('pregame-5', 'Rock You Like a Hurricane', 'Scorpions', 'CGfKi6kpdTQ', 0),
      createDefaultSong('pregame-6', 'Enter Sandman', 'Metallica', 'CD-E-LDc384', 0),
      createDefaultSong('pregame-7', 'Kickstart My Heart', 'Mötley Crüe', 'NrOemQaEJGU', 0),
      createDefaultSong('pregame-8', 'Jump', 'Van Halen', 'SwYN7mTi6HM', 0),
      createDefaultSong('pregame-9', 'Crazy Train', 'Ozzy Osbourne', 'tMDFv5m18Pw', 0),
      createDefaultSong('pregame-10', 'Start Me Up', 'The Rolling Stones', 'SGyOaCXr8Lw', 0)
    ]
  },
  {
    id: 'postgame',
    name: 'Post-Game',
    image: '🏆',
    playedSongs: [],
    songs: [
      createDefaultSong('postgame-1', 'We Are The Champions', 'Queen', 'rY0WxgSXdEE', 0),
      createDefaultSong('postgame-2', 'Don\'t Stop Believin\'', 'Journey', '1k8craCGpgs', 0),
      createDefaultSong('postgame-3', 'Good Times', 'Chic', 'HSTqbKKX6OE', 0),
      createDefaultSong('postgame-4', 'Good Riddance (Time of Your Life)', 'Green Day', 'CnQ8N1KacJc', 0),
      createDefaultSong('postgame-5', 'I Want It That Way', 'Backstreet Boys', '4fndeDfaWCg', 0),
      createDefaultSong('postgame-6', 'Closing Time', 'Semisonic', 'xGytDsqkQY8', 0),
      createDefaultSong('postgame-7', 'All Star', 'Smash Mouth', 'L_jWHffIx5E', 0),
      createDefaultSong('postgame-8', 'Best Day of My Life', 'American Authors', '6lQFzEgn5dA', 0),
      createDefaultSong('postgame-9', 'Victorious', 'Panic! At The Disco', 'AUChk0lxF44', 0),
      createDefaultSong('postgame-10', 'Hall of Fame', 'The Script ft. will.i.am', 'mk48xRzuNvA', 0)
    ]
  }
];