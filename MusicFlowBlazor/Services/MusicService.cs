using MusicFlowBlazor.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MusicFlowBlazor.Services
{
    public class MusicService
    {
        private readonly LocalStorageService _localStorageService;
        private const string PlaylistsKey = "music-playlists";
        private const string PlaybackStateKey = "playback-state";
        private const string AppSettingsKey = "app-settings";

        public List<Playlist> Playlists { get; private set; }
        public PlaybackState PlaybackState { get; private set; }
        public AppSettings AppSettings { get; private set; }

        public MusicService(LocalStorageService localStorageService)
        {
            _localStorageService = localStorageService;
        }

        public async Task LoadAsync()
        {
            Playlists = await _localStorageService.GetItemAsync<List<Playlist>>(PlaylistsKey) ?? new List<Playlist>();
            PlaybackState = await _localStorageService.GetItemAsync<PlaybackState>(PlaybackStateKey) ?? new PlaybackState();
            AppSettings = await _localStorageService.GetItemAsync<AppSettings>(AppSettingsKey) ?? new AppSettings
            {
                Layout = new LayoutSettings
                {
                    CardsPerRow = 3,
                    CardSize = "small",
                    ShowSongCount = true,
                    ShowCurrentSong = true
                }
            };
        }

        public async Task SavePlaylistsAsync()
        {
            await _localStorageService.SetItemAsync(PlaylistsKey, Playlists);
        }

        public async Task SavePlaybackStateAsync()
        {
            await _localStorageService.SetItemAsync(PlaybackStateKey, PlaybackState);
        }

        public async Task SaveAppSettingsAsync()
        {
            await _localStorageService.SetItemAsync(AppSettingsKey, AppSettings);
        }
    }
}
