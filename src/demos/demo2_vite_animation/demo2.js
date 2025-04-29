export async function init(containerId) {
    const container = document.getElementById(containerId);
  
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.width = '300px';
    wrapper.style.height = '300px';
    container.appendChild(wrapper);
  
    const foldersAndFiles = [
      { id: 'public', text: '/public', top: '40px', left: '10px', class: 'folder' },
      { id: 'src', text: '/src', top: '40px', left: '90px', class: 'folder' },
      { id: 'indexhtml', text: 'index.html', top: '150px', left: '40px', class: 'file' },
      { id: 'viteconfig', text: 'vite.config.js', top: '150px', left: '160px', class: 'file' },
    ];
  
    foldersAndFiles.forEach(item => {
      const div = document.createElement('div');
      div.id = item.id;
      div.className = item.class;
      div.style.position = 'absolute';
      div.style.width = '120px';
      div.style.height = '40px';
      div.style.lineHeight = '40px';
      div.style.textAlign = 'center';
      div.style.border = '2px solid #00d8ff';
      div.style.borderRadius = '8px';
      div.style.opacity = '0';
      div.style.transform = 'scale(0.5)';
      div.style.top = item.top;
      div.style.left = item.left;
      div.style.background = item.class === 'folder' ? '#007acc' : '#333';
      div.innerText = item.text;
      wrapper.appendChild(div);
    });
  
    function animateElement(id, delay) {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) { // ✅ Check if element exists
          el.style.transition = 'all 0.7s ease-out';
          el.style.opacity = '1';
          el.style.transform = 'scale(1)';
        }
      }, delay);
    }
  
    animateElement('public', 500);
    animateElement('src', 1200);
    animateElement('indexhtml', 1900);
    animateElement('viteconfig', 2600);
  
    return {
      dispose() {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }
  