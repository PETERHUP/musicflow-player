namespace MusicFlowBlazor.Models
{
    public class Playlist
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public List<Song> Songs { get; set; } = new List<Song>();
        public string? Image { get; set; }
        public List<string> PlayedSongs { get; set; } = new List<string>();
    }
}
