/* ===== 全局工具函数 ===== */

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const now = new Date();
  const diff = now - d;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return minutes + '分钟前';
  if (hours < 24) return hours + '小时前';
  if (days < 7) return days + '天前';

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  if (y === now.getFullYear()) return m + '-' + day + ' ' + h + ':' + min;
  return y + '-' + m + '-' + day;
}

// 获取URL参数
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// 获取相关元素
function $(sel, ctx) { return (ctx || document).querySelector(sel); }
function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

// 显示/隐藏加载
function showLoading(container) {
  if (!container) return;
  container.innerHTML = '<div class="spinner"></div>';
}

// ─── 深色模式 ───

function initTheme() {
  // 浅色模式固定，无主题切换功能
  document.documentElement.classList.remove('dark');
}

// ─── 移动端菜单 ───

function initMobileMenu() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.mobile-menu-btn');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  });

  // 点击菜单项关闭
  document.addEventListener('click', (e) => {
    const link = e.target.closest('#mobileMenu a');
    if (!link) return;
    document.getElementById('mobileMenu').style.display = 'none';
  });
}

// ─── API 调用 ───

const API_BASE = '';

async function apiGet(url) {
  const resp = await fetch(API_BASE + url);
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  return resp.json();
}

async function apiPost(url, data) {
  const resp = await fetch(API_BASE + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  return resp.json();
}

async function apiPut(url, data) {
  const resp = await fetch(API_BASE + url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  return resp.json();
}

async function apiDelete(url) {
  const resp = await fetch(API_BASE + url, { method: 'DELETE' });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  return resp.json();
}

// ─── 首页：新闻轮播 ───

function initCarousel() {
  const container = document.getElementById('carousel');
  if (!container) return;

  apiGet('/api/news/hot?limit=35').then(news => {
    if (!news || news.length === 0) {
      container.innerHTML = '<div style="height:380px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--bg-secondary);border-radius:12px;color:var(--text-muted)"><p class="text-lg font-medium">暂无头条新闻</p><p class="text-sm mt-1">新闻爬取完成后将在此展示</p></div>';
      return;
    }

    // 过滤掉没有有效标题的项
    news = news.filter(n => n.title && n.title.length > 4);

    let current = 0;
    const total = news.length;

    container.innerHTML = `
      <div class="carousel-container">
        <div class="carousel-track" id="carouselTrack">
          ${news.map((item, i) => `
            <div class="carousel-slide">
              <a href="${item.url}" target="_blank" rel="noopener" class="carousel-slide-link">
                <div class="carousel-slide-content">
                  ${item.category ? `<span class="carousel-badge">${item.category}</span>` : ''}
                  <h3 class="carousel-title">${item.title}</h3>
                  <div class="carousel-info">
                    <span><i class="fas fa-tag"></i> ${item.source}</span>
                    <span class="carousel-dot-sep">·</span>
                    <span><i class="far fa-clock"></i> ${formatDate(item.publish_time)}</span>
                  </div>
                </div>
              </a>
            </div>
          `).join('')}
        </div>
        <button class="carousel-btn carousel-prev" id="carouselPrev"><i class="fas fa-chevron-left"></i></button>
        <button class="carousel-btn carousel-next" id="carouselNext"><i class="fas fa-chevron-right"></i></button>
        <div class="carousel-dots" id="carouselDots">
          ${Array.from({length: total}, (_, i) => `
            <button class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></button>
          `).join('')}
        </div>
      </div>
    `;

    const track = document.getElementById('carouselTrack');
    const dots = $$('.carousel-dot');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    let autoPlayTimer;

    function goTo(index) {
      current = index;
      if (current < 0) current = total - 1;
      if (current >= total) current = 0;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    }

    function nextSlide() { goTo(current + 1); }
    function prevSlide() { goTo(current - 1); }

    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    }

    prevBtn.addEventListener('click', () => { prevSlide(); startAutoPlay(); });
    nextBtn.addEventListener('click', () => { nextSlide(); startAutoPlay(); });

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        goTo(parseInt(dot.dataset.index));
        startAutoPlay();
      });
    });

    container.addEventListener('mouseenter', stopAutoPlay);
    container.addEventListener('mouseleave', startAutoPlay);

    startAutoPlay();
  }).catch(err => {
    container.innerHTML = '<div style="height:380px;display:flex;align-items:center;justify-content:center;background:var(--bg-secondary);border-radius:12px;color:#ef4444">加载新闻失败</div>';
  });
}

// ─── 首页：侧边栏今日热点 ───

function initSidebarNews() {
  const container = document.getElementById('sidebarNews');
  if (!container) return;

  apiGet('/api/news/latest?limit=10').then(news => {
    if (!news || news.length === 0) {
      container.innerHTML = '<div class="py-8 text-center text-gray-400"><i class="fas fa-newspaper text-3xl mb-2"></i><p class="text-sm">暂无新闻</p></div>';
      return;
    }

    container.innerHTML = news.map((item, i) => `
      <div class="sidebar-news-item flex items-start">
        <span class="hot-badge ${i < 3 ? 'top3' : ''}">${i + 1}</span>
        <div class="flex-1 min-w-0">
          <a href="${item.url}" target="_blank" rel="noopener" title="${item.title}">${item.title}</a>
          <div class="news-time"><span class="inline-block w-1 h-1 rounded-full mr-1.5 align-middle" style="background:var(--text-muted)"></span>${item.source} · ${formatDate(item.publish_time)}</div>
        </div>
      </div>
    `).join('');
  }).catch(err => {
    container.innerHTML = '<div class="py-8 text-center text-red-400"><i class="fas fa-exclamation-circle text-2xl mb-2"></i><p class="text-sm">加载失败</p></div>';
  });
}

// ─── 文章卡片渲染 ───

function estimateReadingTime(text) {
  if (!text) return 1;
  const charCount = text.replace(/\s/g, '').length;
  const minutes = Math.max(1, Math.round(charCount / 300));
  return minutes;
}

function renderPostCards(container, posts, page, totalPages) {
  if (!posts || posts.length === 0) {
    container.innerHTML = '<div class="flex flex-col items-center justify-center py-16 text-gray-400"><i class="fas fa-inbox text-5xl mb-4"></i><p class="text-lg font-medium">还没有文章</p><p class="text-sm mt-1">快去管理后台写第一篇吧</p></div>';
    return;
  }

  container.innerHTML = posts.map(post => `
    <a href="post.html?id=${post.id}" class="card card-hover post-card cursor-pointer">
      ${post.image_url ? `<div class="post-card-image-wrap"><img src="${post.image_url}" alt="${post.title}" class="post-card-image" onerror="this.closest('.post-card-image-wrap').style.display='none'"></div>` : ''}
      <div class="post-card-body">
        <h2 class="post-card-title">${post.title}</h2>
        <div class="post-card-meta">
          <span><i class="far fa-calendar-alt"></i> ${formatDate(post.publish_time)}</span>
          ${post.category ? `<span><i class="far fa-folder"></i> <span class="category-tag">${post.category}</span></span>` : ''}
          <span class="reading-time"><i class="far fa-clock"></i> ${estimateReadingTime(post.summary + post.title)} 分钟阅读</span>
        </div>
        <p class="post-card-summary">${post.summary || '暂无摘要'}</p>
      </div>
    </a>
  `).join('');

  // 分页
  const pagination = document.getElementById('pagination');
  if (pagination) {
    renderPagination(pagination, page, totalPages);
  }
}

// ─── 分页渲染 ───

function renderPagination(container, current, total) {
  if (!container) return;
  if (total <= 1) { container.innerHTML = ''; return; }

  let html = '';

  if (current > 1) {
    html += `<a href="?page=${current - 1}" class="page-btn" data-page="${current - 1}"><i class="fas fa-chevron-left"></i></a>`;
  } else {
    html += `<span class="page-btn disabled"><i class="fas fa-chevron-left"></i></span>`;
  }

  // 页码范围
  let start = Math.max(1, current - 2);
  let end = Math.min(total, current + 2);

  if (start > 1) {
    html += `<a href="?page=1" class="page-btn" data-page="1">1</a>`;
    if (start > 2) html += `<span class="page-btn disabled">…</span>`;
  }

  for (let i = start; i <= end; i++) {
    html += `<a href="?page=${i}" class="page-btn ${i === current ? 'active' : ''}" data-page="${i}">${i}</a>`;
  }

  if (end < total) {
    if (end < total - 1) html += `<span class="page-btn disabled">…</span>`;
    html += `<a href="?page=${total}" class="page-btn" data-page="${total}">${total}</a>`;
  }

  if (current < total) {
    html += `<a href="?page=${current + 1}" class="page-btn" data-page="${current + 1}"><i class="fas fa-chevron-right"></i></a>`;
  } else {
    html += `<span class="page-btn disabled"><i class="fas fa-chevron-right"></i></span>`;
  }

  container.innerHTML = html;

  // 点击分页加载（不刷新页面）
  container.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const page = parseInt(btn.dataset.page);
      if (!isNaN(page)) {
        const url = new URL(window.location);
        url.searchParams.set('page', page);
        window.history.pushState({}, '', url);
        loadPosts();
      }
    });
  });
}

// ─── 首页：加载文章列表 ───

function loadPosts() {
  const container = document.getElementById('postsContainer');
  if (!container) return;

  const page = parseInt(getQueryParam('page')) || 1;
  const category = getQueryParam('category');

  // 骨架屏已在HTML中，不替换为spinner

  let promise;
  if (category) {
    promise = apiGet(`/api/posts/category/${encodeURIComponent(category)}?page=${page}&size=10`);
  } else {
    promise = apiGet(`/api/posts?page=${page}&size=10`);
  }

  promise.then(data => {
    renderPostCards(container, data.rows, data.page, data.totalPages);

    // 更新分类高亮
    if (category) {
      $$('.category-nav a').forEach(a => {
        a.classList.toggle('active', a.dataset.category === category);
      });
    }
  }).catch(err => {
    container.innerHTML = '<div class="flex flex-col items-center justify-center py-16 text-red-400"><i class="fas fa-exclamation-triangle text-4xl mb-3"></i><p>文章加载失败</p><button onclick="loadPosts()" class="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition">重试</button></div>';
  });
}

// ─── 首页：加载分类列表 ───

function loadCategories() {
  const container = document.getElementById('categoryNav');
  if (!container) return;

  apiGet('/api/posts/categories/list').then(cats => {
    const currentCat = getQueryParam('category');
    let html = `<a href="?" class="category-nav-link ${!currentCat ? 'active' : ''}" data-category="">全部</a>`;
    cats.forEach(c => {
      const active = currentCat === c.category;
      html += `<a href="?category=${encodeURIComponent(c.category)}" class="category-nav-link ${active ? 'active' : ''}" data-category="${c.category}">${c.category}</a>`;
    });
    container.innerHTML = html;

    container.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = a.dataset.category;
        const url = cat ? `?category=${encodeURIComponent(cat)}` : '?page=1';
        window.history.pushState({}, '', url);
        loadPosts();
        loadCategories();
      });
    });
  }).catch(() => {});
}

// ─── 文章详情页 ───

function loadPostDetail() {
  const id = getQueryParam('id');
  if (!id) { showError('缺少文章ID'); return; }

  apiGet(`/api/posts/${id}`).then(post => {
    if (!post) { showError('文章不存在'); return; }

    document.title = post.title + ' - MyBlog';
    $('#loadingState').classList.add('hidden');
    $('#errorState').classList.add('hidden');
    $('#postContent').classList.remove('hidden');

    // 文章头部
    $('#postTitle').textContent = post.title;
    if ($('#postDate')) $('#postDate').textContent = formatDate(post.publish_time);
    if ($('#postCategory')) $('#postCategory').textContent = post.category || '未分类';
    if ($('#postViews')) $('#postViews').textContent = post.views || 0;
    if ($('#postTags')) {
      $('#postTags').innerHTML = post.tags
        ? post.tags.split(',').map(t => `<span class="category-tag ml-1">${t.trim()}</span>`).join('')
        : '';
    }

    // 封面图
    if (post.image_url) {
      $('#postCover').classList.remove('hidden');
      $('#postCoverImg').src = post.image_url;
    }

    // 渲染Markdown
    $('#articleBody').innerHTML = marked.parse(post.content);
    $('#articleBody').querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));

    // 目录
    generateTOC($('#articleBody'));

    // 上下篇
    if ($('#prevPost')) {
      if (post.prev) {
        $('#prevPost').classList.remove('hidden');
        $('#prevPost').href = 'post.html?id=' + post.prev.id;
        $('#prevTitle').textContent = post.prev.title;
      }
    }
    if ($('#nextPost')) {
      if (post.next) {
        $('#nextPost').classList.remove('hidden');
        $('#nextPost').href = 'post.html?id=' + post.next.id;
        $('#nextTitle').textContent = post.next.title;
      }
    }
  }).catch(err => {
    showError('加载失败: ' + err.message);
  });

  function showError(msg) {
    $('#loadingState').classList.add('hidden');
    $('#errorState').classList.remove('hidden');
    $('#errorState').querySelector('p').textContent = msg;
  }
}

// ─── 文章目录生成 ───

function generateTOC(container) {
  const tocEl = document.getElementById('tocContainer');
  if (!tocEl) return;

  const headings = container.querySelectorAll('h1, h2, h3, h4');
  if (headings.length === 0) {
    tocEl.innerHTML = '<p class="text-gray-400 text-sm">暂无目录</p>';
    return;
  }

  // 给标题添加id
  headings.forEach((h, i) => {
    const id = 'heading-' + i;
    h.id = id;
  });

  let html = '';
  headings.forEach((h, i) => {
    const level = h.tagName.toLowerCase();
    const text = h.textContent;
    html += `<a href="#heading-${i}" class="toc-link ${level}">${text}</a>`;
  });

  tocEl.innerHTML = html;

  // 滚动监听高亮
  const tocLinks = tocEl.querySelectorAll('.toc-link');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        tocLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-80px 0px -70% 0px' });

  headings.forEach(h => observer.observe(h));

  // 平滑滚动
  tocLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ─── 新闻列表页 ───

// ─── 筛选状态 ───
const filterState = {
  sources: new Set(),
  categories: new Set(),
  sourceAll: true,
  categoryAll: true,
  page: 1,
};

function loadNewsList() {
  const container = document.getElementById('newsListContainer');
  if (!container) return;

  // 保持当前内容避免抖动

  // 从最新新闻列表中查找
  apiGet('/api/news/latest?limit=1000').then(allNews => {
    // 客户端过滤
    let filtered = allNews;
    if (!filterState.sourceAll && filterState.sources.size > 0) {
      filtered = filtered.filter(n => filterState.sources.has(n.source));
    }
    if (!filterState.categoryAll && filterState.categories.size > 0) {
      filtered = filtered.filter(n => filterState.categories.has(n.category));
    }

    // 排序（按时间倒序）
    filtered.sort((a, b) => new Date(b.publish_time) - new Date(a.publish_time));

    // 分页
    const size = 20;
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / size));
    const page = filterState.page;
    const start = (page - 1) * size;
    const pageData = filtered.slice(start, start + size);

    if (pageData.length === 0) {
      container.innerHTML = '<div class="text-center py-12 text-gray-400"><i class="fas fa-newspaper text-4xl mb-4 block"></i>暂无匹配新闻</div>';
    } else {
      container.innerHTML = pageData.map(item => `
        <div class="news-card${!item.image_url ? ' no-img' : ''}">
          ${item.image_url
            ? `<div class="news-card-img-wrap"><img src="${item.image_url}" alt="${item.title}" class="news-card-img" onerror="this.parentElement.closest('.news-card').classList.add('no-img');this.parentElement.remove()"></div>`
            : ''
          }
          <div class="news-card-body">
            <a href="${item.url}" target="_blank" rel="noopener" class="news-card-title">${item.title}</a>
            <p class="text-gray-500 text-sm mb-2 truncate-2">${item.summary || item.title}</p>
            <div class="flex flex-wrap gap-2 text-xs text-gray-400">
              <span><i class="fas fa-tag mr-0.5"></i>${item.source}</span>
              ${item.category ? `<span><i class="far fa-folder mr-0.5"></i>${item.category}</span>` : ''}
              <span><i class="far fa-clock mr-0.5"></i>${formatDate(item.publish_time)}</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    // 分页
    const pagination = document.getElementById('newsPagination');
    if (pagination) {
      renderNewsPagination(pagination, page, totalPages);
    }

    // 统计
    const stats = document.getElementById('newsStats');
    if (stats) {
      stats.textContent = `共 ${total} 条匹配结果`;
    }
  }).catch(err => {
    // 不替换全部内容避免抖动，仅在顶部追加提示
    if (!container.querySelector('.news-load-error')) {
      const errDiv = document.createElement('div');
      errDiv.className = 'news-load-error text-center py-3 text-red-500 text-sm';
      errDiv.textContent = '加载失败，请重试';
      container.prepend(errDiv);
    }
  });
}

function renderNewsPagination(container, current, total) {
  if (!container) return;
  if (total <= 1) { container.innerHTML = ''; return; }

  let html = '<div class="flex justify-center gap-1">';

  if (current > 1) {
    html += `<button class="page-btn" data-page="${current - 1}"><i class="fas fa-chevron-left"></i></button>`;
  }

  let start = Math.max(1, current - 2);
  let end = Math.min(total, current + 2);

  if (start > 1) {
    html += `<button class="page-btn" data-page="1">1</button>`;
    if (start > 2) html += '<span class="page-btn disabled">…</span>';
  }

  for (let i = start; i <= end; i++) {
    html += `<button class="page-btn ${i === current ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }

  if (end < total) {
    if (end < total - 1) html += '<span class="page-btn disabled">…</span>';
    html += `<button class="page-btn" data-page="${total}">${total}</button>`;
  }

  if (current < total) {
    html += `<button class="page-btn" data-page="${current + 1}"><i class="fas fa-chevron-right"></i></button>`;
  }

  html += '</div>';
  container.innerHTML = html;

  // 分页点击
  container.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      filterState.page = parseInt(btn.dataset.page);
      loadNewsList();
    });
  });
}

// ─── 新闻筛选器（多选） ───

function initNewsFilters() {
  // 来源筛选
  const sourceFilter = document.getElementById('sourceFilter');
  if (sourceFilter) {
    apiGet('/api/news/sources').then(sources => {
      let html = '<button class="filter-btn active" data-group="source" data-value="">全部来源</button>';
      sources.forEach(s => {
        html += `<button class="filter-btn" data-group="source" data-value="${s.source}">${s.source}</button>`;
      });
      sourceFilter.innerHTML = html;

      sourceFilter.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.dataset.value;
          if (!val) {
            // 点击"全部来源"
            filterState.sourceAll = true;
            filterState.sources.clear();
            sourceFilter.querySelectorAll('.filter-btn').forEach(b => {
              b.classList.toggle('active', b.dataset.value === '');
            });
          } else {
            // 点击具体来源
            filterState.sourceAll = false;
            if (filterState.sources.has(val)) {
              filterState.sources.delete(val);
            } else {
              filterState.sources.add(val);
            }
            // 如果全部取消选中，回到"全部"
            if (filterState.sources.size === 0) {
              filterState.sourceAll = true;
            }
            // 更新高亮
            sourceFilter.querySelectorAll('.filter-btn').forEach(b => {
              if (b.dataset.value === '') {
                b.classList.toggle('active', filterState.sourceAll);
              } else {
                b.classList.toggle('active', filterState.sources.has(b.dataset.value));
              }
            });
          }
          filterState.page = 1;
          loadNewsList();
        });
      });
    }).catch(() => {});
  }

  // 分类筛选
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    apiGet('/api/news/categories').then(cats => {
      let html = '<button class="filter-btn active" data-group="category" data-value="">全部分类</button>';
      cats.forEach(c => {
        html += `<button class="filter-btn" data-group="category" data-value="${c.category}">${c.category}</button>`;
      });
      categoryFilter.innerHTML = html;

      categoryFilter.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.dataset.value;
          if (!val) {
            // 点击"全部分类"
            filterState.categoryAll = true;
            filterState.categories.clear();
            categoryFilter.querySelectorAll('.filter-btn').forEach(b => {
              b.classList.toggle('active', b.dataset.value === '');
            });
          } else {
            // 点击具体分类
            filterState.categoryAll = false;
            if (filterState.categories.has(val)) {
              filterState.categories.delete(val);
            } else {
              filterState.categories.add(val);
            }
            if (filterState.categories.size === 0) {
              filterState.categoryAll = true;
            }
            categoryFilter.querySelectorAll('.filter-btn').forEach(b => {
              if (b.dataset.value === '') {
                b.classList.toggle('active', filterState.categoryAll);
              } else {
                b.classList.toggle('active', filterState.categories.has(b.dataset.value));
              }
            });
          }
          filterState.page = 1;
          loadNewsList();
        });
      });
    }).catch(() => {});
  }
}

// ─── 新闻详情页 ───

function loadNewsDetail() {
  const container = document.getElementById('newsDetail');
  if (!container) return;

  const id = getQueryParam('id');
  if (!id) {
    container.innerHTML = '<div class="text-center py-12 text-red-500">缺少新闻ID</div>';
    return;
  }

  showLoading(container);

  // 从最新新闻列表中查找
  apiGet('/api/news/latest?limit=1000').then(allNews => {
    const news = allNews.find(n => n.id == id);
    if (!news) {
      container.innerHTML = '<div class="text-center py-12">新闻不存在</div>';
      return;
    }

    document.title = news.title + ' - MyBlog新闻';

    container.innerHTML = `
      <div class="max-w-3xl mx-auto">
        <h1 class="text-2xl md:text-3xl font-bold mb-4">${news.title}</h1>
        <div class="flex flex-wrap gap-3 text-gray-500 text-sm mb-6">
          <span class="category-tag">${news.source}</span>
          ${news.category ? `<span class="category-tag">${news.category}</span>` : ''}
          <span><i class="far fa-clock"></i> ${formatDate(news.publish_time)}</span>
        </div>
        ${news.image_url ? `<img src="${news.image_url}" alt="${news.title}" class="w-full rounded-lg mb-6 max-h-96 object-cover" onerror="this.style.display='none'">` : ''}
        <div class="article-content text-gray-600 dark:text-gray-300 mb-8">
          <p>${news.summary || '暂无详细内容'}</p>
        </div>
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6 text-center">
          <a href="${news.url}" target="_blank" rel="noopener noreferrer"
             class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <i class="fas fa-external-link-alt"></i> 查看原文
          </a>
        </div>
        <div class="mt-6 text-center">
          <a href="news-list.html" class="text-blue-500 hover:text-blue-600">
            <i class="fas fa-arrow-left"></i> 返回新闻列表
          </a>
        </div>
      </div>
    `;
  }).catch(err => {
    container.innerHTML = '<div class="text-center py-12 text-red-500">加载失败: ' + err.message + '</div>';
  });
}

// ─── 管理后台 ───

// 登录
function initAdmin() {
  const token = localStorage.getItem('admin_token');
  if (token) {
    apiGet('/api/admin/check?token=' + token).then(res => {
      if (res.authenticated) { showAdmin(); return; }
      localStorage.removeItem('admin_token');
      showLoginModal();
    }).catch(() => {
      localStorage.removeItem('admin_token');
      showLoginModal();
    });
  } else {
    showLoginModal();
  }
}

function showLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.add('show');
}

function hideLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.remove('show');
}

async function handleLogin(password) {
  try {
    const res = await apiPost('/api/admin/login', { password });
    if (res.success) {
      localStorage.setItem('admin_token', res.token);
      hideLoginModal();
      showAdmin();
    }
  } catch (err) {
    alert('密码错误');
  }
}

function showAdmin() {
  document.body.classList.add('admin-authenticated');
  // 加载文章列表
  loadAdminPosts();
}

function logout() {
  localStorage.removeItem('admin_token');
  window.location.reload();
}

function loadAdminPosts() {
  const container = document.getElementById('adminPostsList');
  if (!container) return;

  showLoading(container);

  apiGet('/api/posts?page=1&size=100').then(data => {
    if (!data.rows || data.rows.length === 0) {
      container.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-400">暂无文章</td></tr>';
      return;
    }

    container.innerHTML = data.rows.map(post => `
      <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
        <td class="py-3 px-4">
          <a href="edit.html?id=${post.id}" class="text-blue-600 hover:text-blue-800 font-medium">${post.title}</a>
        </td>
        <td class="py-3 px-4 text-sm text-gray-500">${post.category || '-'}</td>
        <td class="py-3 px-4 text-sm text-gray-500">${post.views || 0}</td>
        <td class="py-3 px-4 text-sm text-gray-500">${formatDate(post.publish_time)}</td>
        <td class="py-3 px-4">
          <div class="flex gap-2">
            <a href="edit.html?id=${post.id}" class="text-blue-500 hover:text-blue-700"><i class="fas fa-edit"></i></a>
            <button onclick="deletePost(${post.id})" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }).catch(err => {
    container.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-red-500">加载失败</td></tr>';
  });
}

async function deletePost(id) {
  if (!confirm('确定删除此文章？')) return;
  try {
    const token = localStorage.getItem('admin_token');
    await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': token },
    });
    loadAdminPosts();
  } catch (err) {
    alert('删除失败');
  }
}

// ─── 文章编辑 ───

function initEditor() {
  const editor = document.getElementById('editor');
  const preview = document.getElementById('preview');
  if (!editor || !preview) return;

  const id = getQueryParam('id');
  if (id) {
    // 编辑模式：加载文章
    document.title = '编辑文章 - MyBlog';
    apiGet(`/api/posts/${id}`).then(post => {
      if (!post) { alert('文章不存在'); return; }
      $('#title').value = post.title;
      $('#category').value = post.category || '';
      $('#tags').value = post.tags || '';
      $('#summary').value = post.summary || '';
      $('#image_url').value = post.image_url || '';
      editor.value = post.content;
      updatePreview();
    });
  } else {
    document.title = '写文章 - MyBlog';
    // 新建模式：填充默认示例
    editor.value = '# 欢迎写文章\n\n在这里输入Markdown内容...';
    updatePreview();
  }

  editor.addEventListener('input', updatePreview);
}

function updatePreview() {
  const editor = document.getElementById('editor');
  const preview = document.getElementById('preview');
  if (editor && preview) {
    preview.innerHTML = marked.parse(editor.value);
    preview.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block);
    });
  }
}

async function savePost() {
  const id = getQueryParam('id');
  const data = {
    title: $('#title').value,
    content: $('#editor').value,
    category: $('#category').value,
    tags: $('#tags').value,
    summary: $('#summary').value || $('#editor').value.substring(0, 200).replace(/[#*`]/g, ''),
    image_url: $('#image_url').value,
  };

  if (!data.title) { alert('请输入标题'); return; }
  if (!data.content) { alert('请输入内容'); return; }

  try {
    const token = localStorage.getItem('admin_token');
    const headers = { 'Content-Type': 'application/json', 'x-admin-token': token };

    let resp;
    if (id) {
      resp = await fetch(`/api/posts/${id}`, { method: 'PUT', headers, body: JSON.stringify(data) });
    } else {
      resp = await fetch('/api/posts', { method: 'POST', headers, body: JSON.stringify(data) });
    }

    if (resp.ok) {
      window.location.href = 'posts.html';
    } else {
      alert('保存失败');
    }
  } catch (err) {
    alert('保存失败: ' + err.message);
  }
}

// ─── 初始化 ───

document.addEventListener('DOMContentLoaded', () => {
  // ── 检测是否通过 file:// 打开 ──
  if (window.location.protocol === 'file:') {
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f172a;color:#f1f5f9;font-family:sans-serif;padding:2rem;text-align:center;">
        <div>
          <h1 style="font-size:1.8rem;margin-bottom:1rem;">⚠️ 无法直接打开页面</h1>
          <p style="color:#94a3b8;line-height:1.8;max-width:480px;">
            请先启动 Node.js 服务器，然后访问<br>
            <code style="background:#1e293b;padding:0.3rem 1rem;border-radius:6px;display:inline-block;margin:0.8rem 0;font-size:1.1rem;color:#60a5fa;">
              http://localhost:8080
            </code><br><br>
            启动命令：<br>
            <code style="background:#1e293b;padding:0.2rem 0.8rem;border-radius:4px;font-size:0.9rem;">cd myblog/blog && node server.js</code>
          </p>
        </div>
      </div>`;
    return;
  }

  initTheme();
  initMobileMenu();

  // 按页面初始化
  if (document.getElementById('carousel')) initCarousel();
  if (document.getElementById('sidebarNews')) initSidebarNews();
  if (document.getElementById('postsContainer')) loadPosts();
  if (document.getElementById('categoryNav')) loadCategories();
  if (document.getElementById('postContent')) loadPostDetail();
  if (document.getElementById('newsListContainer')) { loadNewsList(); initNewsFilters(); }
  if (document.getElementById('newsDetail')) loadNewsDetail();
  if (document.getElementById('editor')) initEditor();
  if (document.getElementById('adminPostsList')) initAdmin();

  // 登录按钮
  document.addEventListener('click', (e) => {
    const loginBtn = e.target.closest('#loginBtn');
    if (loginBtn) {
      const pwd = $('#loginPassword');
      if (pwd) handleLogin(pwd.value);
    }
  });

  // 回车登录
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.getElementById('loginModal')?.classList.contains('show')) {
      const pwd = $('#loginPassword');
      if (pwd) handleLogin(pwd.value);
    }
  });

  // 保存按钮
  document.addEventListener('click', (e) => {
    if (e.target.closest('#savePostBtn')) savePost();
  });
});
