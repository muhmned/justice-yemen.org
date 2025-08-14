import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './Carousel.css';

const Carousel = () => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
         try {
              const [newsRes, reportsRes, articlesRes] = await Promise.all([
                    fetch(`${process.env.REACT_APP_API_URL}/api/news`),
                    fetch(`${process.env.REACT_APP_API_URL}/api/reports`),
                    fetch(`${process.env.REACT_APP_API_URL}/api/articles`)
                      ]);

                const newsData = await newsRes.json();
                const reportsData = await reportsRes.json();
                const articlesData = await articlesRes.json();

                const formattedNews = newsData
                    .filter(item => item.status === 'published')
                    .map(item => ({ ...item, type: 'news', link: `/news/${item.id}` }));

                const formattedReports = reportsData
                    .filter(item => item.status === 'published')
                    .map(item => ({ ...item, type: 'report', link: `/reports/${item.id}` }));
                
                const formattedArticles = articlesData.map(item => ({ ...item, type: 'article', link: `/articles/${item.id}` }));

                const combinedData = [...formattedNews, ...formattedReports, ...formattedArticles];
                
                combinedData.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

                setSlides(combinedData.slice(0, 10)); // Get top 10 latest items
            } catch (error) {
                console.error("Failed to fetch carousel data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }, [slides.length]);

    useEffect(() => {
        if (slides.length > 0) {
            const slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
            return () => clearInterval(slideInterval);
        }
    }, [slides, nextSlide]);

    if (loading) {
        return <div className="carousel-loading">جاري تحميل البيانات...</div>;
    }
    
    if (slides.length === 0) {
        return <div className="carousel-empty">لا توجد بيانات لعرضها</div>;
    }

    return (
        <div className="main-carousel">
            {slides.map((slide, index) => (
                <div
                    className={index === currentSlide ? 'carousel-slide active' : 'carousel-slide'}
                    key={`${slide.type}-${slide.id}`}
                >
                    {index === currentSlide && (
                        <Link to={slide.link}>
                            <img 
              src={
              slide.image || slide.thumbnail
                ? (slide.image || slide.thumbnail).startsWith('http')
                ? (slide.image || slide.thumbnail)
                : `${process.env.REACT_APP_API_URL}${slide.image || slide.thumbnail}`
                : 'https://via.placeholder.com/1200x400/007bff/ffffff?text=Justice+Organization'
                        }     
                               alt={slide.title} 
                                className="carousel-image" 
                            />
                            <div className="carousel-caption">
                                <span className="slide-type">
                                    {slide.type === 'news' && 'خبر'}
                                    {slide.type === 'report' && 'تقرير'}
                                    {slide.type === 'article' && 'مقال'}
                                </span>
                                <h3>{slide.title}</h3>
                            </div>
                        </Link>
                    )}
                </div>
            ))}
            <div className="carousel-dots">
                {slides.map((_, index) => (
                    <span 
                        key={index} 
                        className={index === currentSlide ? 'dot active' : 'dot'}
                        onClick={() => setCurrentSlide(index)}
                    ></span>
                ))}
            </div>
        </div>
    );
};

export default Carousel;
