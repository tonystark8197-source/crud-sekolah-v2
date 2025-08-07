import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Memory cache untuk news
const newsMemoryCache = new Map();

export const useNews = (options = {}) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    featured = false,
    autoFetch = true
  } = options;

  // Initialize with cached data (memory first, then localStorage)
  const getCachedNews = () => {
    try {
      const cacheKey = `news_${page}_${limit}_${search}_${featured}`;

      // Check memory cache first
      if (newsMemoryCache.has(cacheKey)) {
        return newsMemoryCache.get(cacheKey);
      }

      // Then check localStorage
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsedData = JSON.parse(cached);
        // Store in memory cache for faster access
        newsMemoryCache.set(cacheKey, parsedData);
        return parsedData;
      }
    } catch (error) {
      // Silent error handling
    }
    return { news: [], pagination: { page: 1, pages: 1, total: 0 } };
  };

  const cachedData = getCachedNews();
  const [news, setNews] = useState(cachedData.news);
  const [loading, setLoading] = useState(false); // Start with false since we have cached data
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(cachedData.pagination);

  const fetchNews = async (fetchOptions = {}) => {
    try {
      setError(null);
      // Don't set loading to true since we already have cached data

      const params = new URLSearchParams({
        page: fetchOptions.page || page,
        limit: fetchOptions.limit || limit,
        ...(fetchOptions.search || search ? { search: fetchOptions.search || search } : {}),
        ...(fetchOptions.featured || featured ? { featured: 'true' } : {})
      });

      const response = await fetch(`${API_BASE_URL}/news?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const newPagination = {
          page: result.page,
          pages: result.pages,
          total: result.total
        };

        // Only update if data actually changed
        const currentDataStr = JSON.stringify({ news, pagination });
        const newDataStr = JSON.stringify({ news: result.data, pagination: newPagination });

        if (currentDataStr !== newDataStr) {
          setNews(result.data);
          setPagination(newPagination);

          // Cache in both memory and localStorage
          const cacheKey = `news_${fetchOptions.page || page}_${fetchOptions.limit || limit}_${fetchOptions.search || search}_${fetchOptions.featured || featured}`;
          const cacheData = {
            news: result.data,
            pagination: newPagination
          };
          newsMemoryCache.set(cacheKey, cacheData);
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        }
      } else {
        throw new Error('Failed to fetch news');
      }
    } catch (err) {
      setError(err.message);
      // Keep cached data, don't overwrite them

      // Only use mock data if no cached data exists
      if (news.length === 0) {
      const mockData = [
        {
          id: 1,
          title: "Prestasi Gemilang Siswa SMA Negeri 1 Jakarta di Olimpiade Matematika Nasional",
          excerpt: "Tim olimpiade matematika sekolah berhasil meraih juara 1 tingkat nasional setelah melalui seleksi ketat dari berbagai daerah di Indonesia.",
          content: "Tim olimpiade matematika SMA Negeri 1 Jakarta berhasil meraih prestasi gemilang dengan meraih juara 1 pada Olimpiade Matematika Nasional 2024. Prestasi ini diraih setelah melalui berbagai tahap seleksi yang ketat mulai dari tingkat sekolah, kabupaten, provinsi, hingga nasional. Tim yang terdiri dari 3 siswa terbaik ini telah mempersiapkan diri selama berbulan-bulan dengan bimbingan intensif dari guru pembimbing. Kepala sekolah menyampaikan rasa bangga dan apresiasi tinggi atas pencapaian luar biasa ini.",
          category: "Prestasi",
          author: "Admin Sekolah",
          date: "2024-12-15T10:00:00Z",
          image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
          views: 245,
          featured: true
        },
        {
          id: 2,
          title: "Pelaksanaan Ujian Tengah Semester Ganjil Tahun Ajaran 2024/2025",
          excerpt: "Ujian Tengah Semester akan dilaksanakan mulai tanggal 20-25 Januari 2025 dengan protokol kesehatan yang ketat.",
          content: "Sekolah mengumumkan jadwal pelaksanaan Ujian Tengah Semester Ganjil untuk semua tingkat kelas. Ujian akan berlangsung selama 6 hari dengan sistem shift untuk menghindari kepadatan. Semua siswa diwajibkan hadir tepat waktu dan membawa perlengkapan ujian yang diperlukan.",
          category: "Akademik",
          author: "Wakil Kepala Sekolah",
          date: "2024-12-10T08:30:00Z",
          image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          views: 189,
          featured: false
        },
        {
          id: 3,
          title: "Festival Seni dan Budaya Sekolah 2024 Sukses Digelar",
          excerpt: "Acara tahunan Festival Seni dan Budaya berhasil menampilkan berbagai kreativitas siswa dalam bidang seni, musik, dan tari tradisional.",
          content: "Festival Seni dan Budaya SMA Negeri 1 Jakarta tahun 2024 telah sukses digelar dengan antusiasme tinggi dari seluruh siswa. Acara ini menampilkan berbagai pertunjukan mulai dari tari tradisional, musik modern, drama, hingga pameran karya seni rupa siswa.",
          category: "Kegiatan",
          author: "Koordinator Ekstrakurikuler",
          date: "2024-12-05T14:00:00Z",
          image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          views: 312,
          featured: true
        },
        {
          id: 4,
          title: "Program Beasiswa Prestasi untuk Siswa Berprestasi Tahun 2025",
          excerpt: "Sekolah membuka program beasiswa prestasi untuk siswa yang memiliki prestasi akademik dan non-akademik outstanding.",
          content: "Dalam rangka mendukung siswa berprestasi, SMA Negeri 1 Jakarta membuka program beasiswa prestasi untuk tahun ajaran 2025. Program ini ditujukan untuk siswa yang memiliki prestasi akademik maupun non-akademik yang luar biasa.",
          category: "Pengumuman",
          author: "Kepala Sekolah",
          date: "2024-12-01T09:00:00Z",
          image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          views: 156,
          featured: false
        },
        {
          id: 5,
          title: "Kunjungan Industri ke Perusahaan Teknologi Terkemuka",
          excerpt: "Siswa kelas XII IPA berkesempatan mengunjungi perusahaan teknologi untuk melihat langsung penerapan ilmu di dunia kerja.",
          content: "Sebagai bagian dari program pembelajaran kontekstual, siswa kelas XII IPA melakukan kunjungan industri ke beberapa perusahaan teknologi terkemuka di Jakarta. Kegiatan ini bertujuan memberikan gambaran nyata tentang penerapan ilmu pengetahuan di dunia kerja.",
          category: "Kegiatan",
          author: "Guru Pembimbing",
          date: "2024-11-28T11:30:00Z",
          image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80",
          views: 203,
          featured: false
        },
        {
          id: 6,
          title: "Peningkatan Fasilitas Laboratorium Komputer dengan Teknologi Terbaru",
          excerpt: "Sekolah melakukan upgrade fasilitas laboratorium komputer dengan perangkat terbaru untuk mendukung pembelajaran digital.",
          content: "Dalam upaya meningkatkan kualitas pembelajaran, SMA Negeri 1 Jakarta telah melakukan upgrade fasilitas laboratorium komputer dengan perangkat terbaru. Investasi ini diharapkan dapat mendukung pembelajaran digital yang semakin penting di era modern.",
          category: "Fasilitas",
          author: "Kepala Lab Komputer",
          date: "2024-11-25T13:15:00Z",
          image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          views: 178,
          featured: false
        },
        {
          id: 7,
          title: "Pelatihan Guru dalam Implementasi Kurikulum Merdeka",
          excerpt: "Seluruh guru mengikuti pelatihan intensif untuk mengimplementasikan Kurikulum Merdeka dengan efektif di kelas.",
          content: "Dalam rangka meningkatkan kualitas pembelajaran, seluruh guru SMA Negeri 1 Jakarta mengikuti pelatihan intensif tentang implementasi Kurikulum Merdeka. Pelatihan ini bertujuan membekali guru dengan strategi pembelajaran yang inovatif dan student-centered.",
          category: "Pelatihan",
          author: "Tim Kurikulum",
          date: "2024-11-20T09:00:00Z",
          image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
          views: 134,
          featured: false
        },
        {
          id: 8,
          title: "Turnamen Olahraga Antar Kelas Semester Ganjil",
          excerpt: "Kompetisi olahraga antar kelas berlangsung seru dengan berbagai cabang olahraga yang dipertandingkan.",
          content: "Turnamen olahraga antar kelas semester ganjil telah berlangsung dengan meriah. Berbagai cabang olahraga seperti futsal, basket, voli, dan badminton dipertandingkan dengan semangat sportivitas yang tinggi dari seluruh siswa.",
          category: "Olahraga",
          author: "Guru Olahraga",
          date: "2024-11-15T15:30:00Z",
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          views: 267,
          featured: false
        },
        {
          id: 9,
          title: "Workshop Kewirausahaan untuk Siswa Kelas XI",
          excerpt: "Siswa kelas XI mendapat kesempatan belajar kewirausahaan dari praktisi bisnis sukses untuk mengembangkan jiwa entrepreneur.",
          content: "Workshop kewirausahaan khusus siswa kelas XI telah diselenggarakan dengan menghadirkan praktisi bisnis sukses sebagai narasumber. Kegiatan ini bertujuan menumbuhkan jiwa entrepreneur dan memberikan bekal keterampilan bisnis kepada siswa.",
          category: "Workshop",
          author: "Koordinator Kesiswaan",
          date: "2024-11-10T13:00:00Z",
          image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          views: 198,
          featured: false
        }
      ];

        setNews(mockData);
        setPagination({
          page: 1,
          pages: 1,
          total: mockData.length
        });
      }
    }
    // No finally block needed since we don't set loading to false
  };

  const getNewsById = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/news/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error('News not found');
      }
    } catch (err) {
      console.error('Error fetching news by ID:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchNews();
    }
  }, [page, limit, search, featured, autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    news,
    loading,
    error,
    pagination,
    fetchNews,
    getNewsById,
    refetch: () => fetchNews()
  };
};

export const useSingleNews = (id) => {
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewsItem = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/news/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setNewsItem(result.data);
        } else {
          throw new Error('News not found');
        }
      } catch (err) {
        console.error('Error fetching news item:', err);
        setError(err.message);
        setNewsItem(null);
      } finally {
        setLoading(false);  
      }
    };

    fetchNewsItem();
  }, [id]);

  return {
    newsItem,
    loading,
    error
  };
};

export default useNews;
