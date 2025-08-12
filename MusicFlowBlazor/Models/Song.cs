namespace MusicFlowBlazor.Models
{
    public class Song
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string? CustomName { get; set; }
        public string Url { get; set; }
        public int StartTime { get; set; }
        public int? Duration { get; set; }
        public string? Thumbnail { get; set; }
        public bool? IsValid { get; set; }
        public long? LastChecked { get; set; }
    }
}
