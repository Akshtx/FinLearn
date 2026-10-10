
import React from 'react';
import { AINewsItemAnalysis, CorporateAnnouncement } from '../../../types';

interface NewsTabProps {
  newsItems: AINewsItemAnalysis[];
  announcements: CorporateAnnouncement[];
}

const NewsItemCard: React.FC<{ item: AINewsItemAnalysis }> = ({ item }) => {
  let sentimentColor = 'bg-gray-600';
  if (item.sentiment === 'Positive') sentimentColor = 'bg-green-600';
  else if (item.sentiment === 'Negative') sentimentColor = 'bg-red-600';

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 hover:shadow-sky-500/10 transition-shadow duration-300">
      <h5 className="font-semibold text-gray-100 mb-1">{item.headline}</h5>
      <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
        <span>{item.originalSource || 'Sourced'} - {item.originalDate || 'Recent'}</span>
        <span className={`px-2 py-0.5 rounded-full text-white text-xs ${sentimentColor}`}>{item.sentiment}</span>
      </div>
      {/* Add link if available */}
    </div>
  );
};

const AnnouncementCard: React.FC<{ item: CorporateAnnouncement }> = ({ item }) => (
  <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 hover:shadow-sky-500/10 transition-shadow duration-300">
    <div className="flex justify-between items-start">
      <h5 className="font-semibold text-gray-100 mb-1 flex-grow pr-2">{item.title}</h5>
      <span className="text-xs bg-sky-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap">{item.category}</span>
    </div>
    <div className="text-xs text-gray-400 mb-2">
      <span>{item.date}</span>
    </div>
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-400 hover:text-sky-300 hover:underline">
      Read More &rarr;
    </a>
  </div>
);


const NewsTab: React.FC<NewsTabProps> = ({ newsItems, announcements }) => {
  return (
    <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
      <section>
        <h4 className="text-xl font-semibold text-sky-400 mb-4">Latest News & Sentiment</h4>
        {newsItems.length > 0 ? (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {newsItems.map((item, index) => (
              <NewsItemCard key={`news-${index}`} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic">No recent news items found.</p>
        )}
      </section>
      <section>
        <h4 className="text-xl font-semibold text-sky-400 mb-4">Corporate Announcements</h4>
        {announcements.length > 0 ? (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {announcements.map((item, index) => (
              <AnnouncementCard key={`announcement-${index}`} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic">No recent corporate announcements found.</p>
        )}
      </section>
    </div>
  );
};

export default NewsTab;
