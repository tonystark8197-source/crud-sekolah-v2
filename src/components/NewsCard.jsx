import React from 'react';

const NewsCard = ({ news }) => {
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Asia/Jakarta'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {news.image ? (
          <img
            src={news.image}
            alt={news.title}
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            style={{
              opacity: 1,
              visibility: 'visible',
              display: 'block'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-news.jpg';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {news.category || 'Berita'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Date and Author */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(news.published_at || news.created_at)}</span>
          {news.author && (
            <>
              <span className="mx-2">•</span>
              <span>Oleh {typeof news.author === 'object' ? news.author.name : news.author}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition duration-300">
          <a href={`/news/${news.id}`} className="line-clamp-2">
            {news.title}
          </a>
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 mb-4 leading-relaxed">
          {truncateText(news.excerpt || news.content)}
        </p>

        {/* Read More Button */}
        <div className="flex items-center justify-between">
          <a 
            href={`/news/${news.id}`}
            className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center transition duration-300"
          >
            Baca Selengkapnya
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
          
          {/* Views/Likes */}
          {news.views && (
            <div className="flex items-center text-gray-500 text-sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {news.views}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
