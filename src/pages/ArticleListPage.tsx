import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StarryBackground from '../components/common/StarryBackground';

interface Article {
  id: string;
  title: string;
  url: string;
  status?: string;
  createdTime: string;
  lastEditedTime: string;
  tags?: string[];
  excerpt?: string;
}

const ArticleListPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/data/articles.json');
        if (!response.ok) throw new Error('아티클 목록을 불러올 수 없습니다.');
        const data = await response.json();
        setArticles(data.articles || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleBackClick = () => {
    navigate('/');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (loading) {
    return (
      <StarryBackground scrollable={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-white">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-lg">아티클을 불러오는 중...</p>
          </div>
        </div>
      </StarryBackground>
    );
  }

  if (error) {
    return (
      <StarryBackground scrollable={true}>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-white bg-white/5 rounded-lg p-8 backdrop-blur-sm"
          >
            <p className="text-red-400 mb-4 text-lg">오류가 발생했습니다: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full font-bold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
            >
              다시 시도
            </button>
          </motion.div>
        </div>
      </StarryBackground>
    );
  }

  return (
    <StarryBackground scrollable={true}>
      <div className="flex flex-col min-h-screen w-full overflow-auto">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-10 flex justify-between items-center px-4 md:px-8 py-4 bg-black/20 backdrop-blur-sm">
          <div className="w-20 md:w-32">
            <button 
              onClick={handleBackClick}
              className="text-white hover:text-purple-300 transition-colors text-sm md:text-base"
            >
              ← 홈으로
            </button>
          </div>
          <div className="text-center text-white text-base md:text-lg font-medium">
            아티클
          </div>
          <div className="w-20 md:w-32"></div>
        </nav>

        {/* Main content */}
        <motion.div 
          className="container mx-auto px-3 sm:px-4 pt-20 md:pt-24 pb-12 md:pb-16 text-white max-w-4xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-purple-200">
              아티클 목록
            </h1>
            <p className="text-center text-white/60 text-base sm:text-lg">
              점성술과 관련된 다양한 이야기들을 만나보세요
            </p>
          </motion.div>
          
          {articles.length === 0 ? (
            <motion.div 
              variants={itemVariants}
              className="text-center text-white/60 bg-white/5 rounded-lg p-12 backdrop-blur-sm"
            >
              <p className="text-lg">아직 작성된 아티클이 없습니다.</p>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Main Articles Section */}
              {articles.filter(article => article.status === 'main').length > 0 && (
                <motion.div variants={itemVariants}>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-purple-200 mb-6 flex items-center">
                      <span className="mr-3">✨</span>
                      추천 아티클
                      <span className="ml-3 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full">
                        FEATURED
                      </span>
                    </h2>
                    <div className="grid gap-6 md:gap-8">
                      {articles
                        .filter(article => article.status === 'main')
                        .map((article, index) => (
                          <motion.div
                            key={article.id}
                            variants={itemVariants}
                            custom={index}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Link
                              to={`/article/${article.url}`}
                              className="block relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl blur-sm"></div>
                              <div className="relative bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-4 sm:p-6 md:p-8 hover:from-white/15 hover:to-white/10 transition-all duration-500 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/50 group shadow-2xl hover:shadow-purple-500/25">
                                <div className="absolute top-4 right-4">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                                    <span className="mr-1">⭐</span>
                                    MAIN
                                  </span>
                                </div>
                                
                                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4 text-white group-hover:text-purple-200 transition-colors leading-tight">
                                  {article.title}
                                </h3>
                                
                                {article.excerpt && (
                                  <p className="text-white/80 mb-4 md:mb-6 text-sm sm:text-base md:text-lg leading-relaxed line-clamp-3">
                                    {article.excerpt}
                                  </p>
                                )}
                                
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                  <div className="flex items-center gap-4 text-sm text-white/60">
                                    <span className="flex items-center">
                                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                      </svg>
                                      {new Date(article.createdTime).toLocaleDateString('ko-KR')}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center text-purple-300 group-hover:text-purple-200 transition-colors self-end sm:self-auto">
                                    <span className="text-xs md:text-sm font-medium mr-2">읽어보기</span>
                                    <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Sub Articles Section */}
              {articles.filter(article => article.status !== 'main').length > 0 && (
                <motion.div variants={itemVariants}>
                  <div>
                    <h2 className="text-xl font-bold text-white/80 mb-6 flex items-center">
                      <span className="mr-3">📚</span>
                      더 많은 아티클
                    </h2>
                    <div className="grid gap-4 md:gap-6">
                      {articles
                        .filter(article => article.status !== 'main')
                        .map((article, index) => (
                          <motion.div
                            key={article.id}
                            variants={itemVariants}
                            custom={index}
                            whileHover={{ scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Link
                              to={`/article/${article.url}`}
                              className="block bg-white/5 rounded-lg p-4 sm:p-5 md:p-6 hover:bg-white/10 transition-all duration-300 hover:shadow-lg backdrop-blur-sm border border-white/10 hover:border-white/20 group"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 text-white group-hover:text-white/90 transition-colors">
                                    {article.title}
                                  </h3>
                                  
                                  <div className="flex items-center gap-4 text-sm text-white/50">
                                    <span>{new Date(article.createdTime).toLocaleDateString('ko-KR')}</span>
                                    
                                    {article.tags && article.tags.length > 0 && (
                                      <div className="flex gap-2">
                                        {article.tags.map((tag, tagIndex) => (
                                          <span 
                                            key={tagIndex}
                                            className="px-2 py-1 bg-white/10 text-white/70 rounded-full text-xs border border-white/20"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="ml-3 md:ml-4 text-white/40 group-hover:text-white/60 transition-colors flex-shrink-0">
                                  <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                  </svg>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <footer className="mt-auto py-6 text-center text-white/60 text-sm">
          © 2025 askstar. All rights reserved.
        </footer>
      </div>
    </StarryBackground>
  );
};

export default ArticleListPage;
