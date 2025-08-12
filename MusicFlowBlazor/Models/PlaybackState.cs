namespace MusicFlowBlazor.Models
{
    public class PlaybackState
    {
        public Song? CurrentSong { get; set; }
        public string? CurrentPlaylistId { get; set; }
        public bool IsPlaying { get; set; }
        public int CurrentTime { get; set; }
        public bool IsShuffled { get; set; }
        public List<Song> Queue { get; set; } = new List<Song>();
        public int QueueIndex { get; set; }
    }
}
