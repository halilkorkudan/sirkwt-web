import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  Search,
  Filter,
  Eye,
  Heart,
  Share2,
  Tag
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [blogPosts, setBlogPosts] = useState([]);
  const [categories, setCategories] = useState(["all"]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  const [postsRef, postsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  useEffect(() => {
    // Backend'den blog yazılarını çekme
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/posts');
        if (!response.ok) {
          throw new Error(`HTTP hatası! Durum: ${response.status}`);
        }
        const data = await response.json();

        if (Array.isArray(data)) {
          setBlogPosts(data);
          // Kategorileri dinamik olarak oluştur
          const uniqueCategories = ["all", ...new Set(data.map(post => post.category))];
          setCategories(uniqueCategories);
        } else {
          throw new Error("Backend'den gelen veri bir dizi formatında değil.");
        }

      } catch (err) {
        setError(err.message);
        console.error("Blog postları çekilirken bir hata oluştu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filtreleme
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Blog yazısının tam halini göster
  const openPost = (post) => {
    setSelectedPost(post);
  };

  // Blog yazısını kapat
  const closePost = () => {
    setSelectedPost(null);
  };

  // Blog yazısı modal component
  const BlogPostModal = ({ post, onClose }) => {
    if (!post) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
        <div className="min-h-screen p-4 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900 rounded-2xl max-w-4xl w-full mx-auto shadow-2xl border border-gray-700/50 relative"
          >
            {/* Kapatma butonu */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-800/80 backdrop-blur-sm rounded-full text-white hover:bg-gray-700 transition-colors duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Blog içeriği */}
            <div className="overflow-y-auto max-h-[90vh]">
              {/* Header Image */}
              <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden rounded-t-2xl">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 lg:p-12">
                {/* Meta bilgiler */}
                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.date).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime} okuma</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{post.views} görüntüleme</span>
                  </div>
                </div>

                {/* Başlık */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight">
                  {post.title}
                </h1>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs font-medium border border-blue-500/30"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* İçerik */}
                <div className="prose prose-invert prose-lg max-w-none">
                  <div
                    className="text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: post.content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                        .replace(/### (.*?)$/gm, '<h3 class="text-xl font-bold text-white mt-8 mb-4">$1</h3>')
                        .replace(/## (.*?)$/gm, '<h2 class="text-2xl font-bold text-white mt-10 mb-6">$1</h2>')
                        .replace(/^\* (.*?)$/gm, '<li class="ml-4 mb-2">$1</li>')
                        .replace(/\n\n/g, '</p><p class="mb-6">')
                        .replace(/^(?!<[h|l])/gm, '<p class="mb-6">')
                        .replace(/<\/p>$/, '')
                    }}
                  />
                </div>

                {/* Social actions */}
                <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-700/50">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-300 rounded-full hover:bg-red-600/30 transition-colors duration-300 border border-red-500/30">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-300 rounded-full hover:bg-blue-600/30 transition-colors duration-300 border border-blue-500/30">
                      <Share2 className="w-4 h-4" />
                      <span>Paylaş</span>
                    </button>
                  </div>
                  <div className="text-sm text-gray-400">
                    Kategori: <span className="text-blue-400 font-medium">{post.category}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1432821596592-e2c18b78144f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-5"></div>

        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
              Blog &
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                İçerikler
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
              Dijital dünya hakkında güncel makaleler, rehberler ve ipuçları.
              Web tasarımından SEO'ya kadar uzman görüşleri.
            </p>
          </motion.div>

          {/* Arama ve Filtre */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto"
          >
            {/* Arama */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Blog yazılarında ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors duration-300"
              />
            </div>

            {/* Kategori Filtresi */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-12 pr-8 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full text-white focus:outline-none focus:border-blue-500/50 transition-colors duration-300 appearance-none min-w-48"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category === 'all' ? 'Tüm Kategoriler' : category}</option>
                ))}
              </select>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts */}
      <section ref={postsRef} className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg">Blog yazıları yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🚨</div>
              <h3 className="text-2xl font-bold text-white mb-2">Hata!</h3>
              <p className="text-gray-400">{error}</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-white mb-2">Henüz blog yazısı bulunamadı</h3>
              <p className="text-gray-400">Arama kriterlerinizi değiştirmeyi deneyin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={postsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="group cursor-pointer"
                  onClick={() => openPost(post)}
                >
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 h-full">
                    {/* Image */}
                    <div className="relative h-48 sm:h-56 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-800/60 via-transparent to-transparent"></div>

                      {/* Kategori badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-blue-500/30">
                          {post.category}
                        </span>
                      </div>

                      {/* Stats overlay */}
                      <div className="absolute bottom-4 right-4 flex items-center gap-3 text-white text-sm">
                        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
                          <Eye className="w-3 h-3" />
                          <span>{post.views}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
                          <Heart className="w-3 h-3" />
                          <span>{post.likes}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Meta bilgiler */}
                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(post.date).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{post.readTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{post.author}</span>
                        </div>
                      </div>

                      {/* Başlık */}
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300 line-clamp-2">
                        {post.title}
                      </h2>

                      {/* Özet */}
                      <p className="text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs flex items-center gap-1"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Read More */}
                      <div className="flex items-center justify-between">
                        <button className="text-blue-400 font-semibold hover:text-blue-300 transition-colors duration-300 flex items-center gap-2 group-hover:gap-4">
                          Devamını Oku
                          <ArrowRight className="w-4 h-4 transition-all duration-300" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {/* Load More Button (gelecekteki genişleme için) */}
          {filteredPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Daha Fazla Yükle
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Blog Post Modal */}
      {selectedPost && (
        <BlogPostModal post={selectedPost} onClose={closePost} />
      )}

      <Footer />
    </div>
  );
}