namespace MusicFlowBlazor.Models
{
    public class LayoutSettings
    {
        public int CardsPerRow { get; set; }
        public string CardSize { get; set; } // "small", "medium", "large"
        public bool ShowSongCount { get; set; }
        public bool ShowCurrentSong { get; set; }
    }
}
