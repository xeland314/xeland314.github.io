import React, { useState } from 'react';

interface Post {
  title: string;
  url: string;
  image: string;
  lang: string;
}

interface Props {
  posts: Post[];
  lang: 'es' | 'en';
}

const BentoPosts: React.FC<Props> = ({ posts, lang }) => {
  const [index, setIndex] = useState(0);

  if (!posts || posts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
        <p className="text-gray-400 text-xs">No posts available</p>
      </div>
    );
  }

  const next = () => setIndex((i) => (i + 1) % posts.length);
  const prev = () => setIndex((i) => (i - 1 + posts.length) % posts.length);

  const post = posts[index];

  return (
    <div className="relative h-full flex flex-col bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm group">
      {/* Header with See all link */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
         <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/90 drop-shadow-md">
            {lang === 'es' ? 'Posts' : 'Posts'}
         </h3>
         <a 
            href={lang === 'es' ? '/es/posts' : '/en/posts'} 
            className="pointer-events-auto text-[9px] font-bold text-white/80 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full transition-all flex items-center gap-1"
         >
            {lang === 'es' ? 'Ver todos' : 'See all'}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
         </a>
      </div>

      <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-900">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" width={"256"} height={"256"} />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent"></div>
        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
          <h3 className="text-white font-bold text-base leading-tight truncate mr-2">{post.title}</h3>
          <span className="text-blue-300 text-[9px] font-mono font-bold bg-blue-900/40 px-1.5 py-0.5 rounded-full">{index + 1} / {posts.length}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between">
        <div className="flex items-center justify-between mt-auto">
          <a href={post.url} className="text-[10px] uppercase tracking-widest font-bold text-blue-600 dark:text-blue-400 hover:underline">
            {lang === 'es' ? 'Leer post' : 'Read post'}
          </a>

          <div className="flex gap-2">
            <button
              onClick={prev}
              aria-label="Previous post"
              className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Next post"
              className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BentoPosts;
