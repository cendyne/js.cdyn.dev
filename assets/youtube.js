(function(){
  for (let parent of document.getElementsByClassName('youtube-embed')) {
    let id = parent.dataset.youtubeId;
    let poster = parent.dataset.youtubePoster;
    parent.style.backgroundImage = `url('${poster}')`;
    parent.style.cursor = 'pointer';
    let dc = document.createElement;
    let dt = document.createTextNode;
    let notice = dc('div');
    notice.classList.add('youtube-embed-notice');
    let na = notice.appendChild;
    na(dt('For your privacy, this youtube video was not automatically loaded.'));
    na(dc('br'));
    na(dt('Click this area to load an embedded youtube video.'));
    parent.replaceChildren(notice);
    parent.addEventListener('click', function() {
      let embed = dc('iframe');
      embed.classList.add('youtube-iframe');
      let es = embed.setAttribute;
      es('width', "100%");
      es('height', "100%");
      es('src', `https://www.youtube-nocookie.com/embed/${id}`);
      es('title', 'Youtube')
      es('frameborder', '0');
      es('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      es('allowfullscreen', '');
      parent.replaceChildren(embed);
      delete parent.style.cursor;
    });
  }
})();