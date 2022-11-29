(function(){
  for (let parent of document.getElementsByClassName('youtube-embed')) {
    let id = parent.dataset.youtubeId;
    let poster = parent.dataset.youtubePoster;
    parent.style.backgroundImage = `url('${poster}')`;
    parent.style.cursor = 'pointer';
    let notice = document.createElement('div');
    notice.classList.add('youtube-embed-notice');
    notice.appendChild(document.createTextNode('For your privacy, this youtube video was not automatically loaded.'));
    notice.appendChild(document.createElement('br'));
    notice.appendChild(document.createTextNode('Click this area to load an embedded youtube video.'));
    parent.replaceChildren(notice);
    parent.addEventListener('click', function() {
      let embed = document.createElement('iframe');
      embed.classList.add('youtube-iframe');
      embed.setAttribute('width', "100%");
      embed.setAttribute('height', "100%");
      embed.setAttribute('src', `https://www.youtube-nocookie.com/embed/${id}`);
      embed.setAttribute('title', 'Youtube')
      embed.setAttribute('frameborder', '0');
      embed.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      embed.setAttribute('allowfullscreen', '');
      parent.replaceChildren(embed);
      delete parent.style.cursor;
    });
  }
})();