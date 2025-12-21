import "./Carousel.css";
import { useState } from "react";

const Carousel = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);

    const maxIndex = items.length - 1;

    const goToPrevious = () => {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
    };

    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > 50 && currentIndex < maxIndex) {
            goToNext();
        }
        if (distance < -50 && currentIndex > 0) {
            goToPrevious();
        }
        setTouchStart(0);
        setTouchEnd(0);
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart(e.clientX);
        setDragOffset(0);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setDragOffset(e.clientX - dragStart);
    };

    const handleMouseUp = () => {
        if (!isDragging) return;
        setIsDragging(false);
        if (dragOffset > 50 && currentIndex > 0) {
            goToPrevious();
        } else if (dragOffset < -50 && currentIndex < maxIndex) {
            goToNext();
        }
        setDragOffset(0);
    };

    const handleMouseLeave = () => {
        if (isDragging) {
            setIsDragging(false);
            setDragOffset(0);
        }
    };

    return (
        <div className="carousel-wrapper">
            <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="carousel-btn"
            >
                <div>&lt;</div>
            </button>

            <div
                className={`carousel-container ${isDragging ? "dragging" : ""}`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                <div
                    className="carousel-track"
                    style={{
                        transform: `translateX(calc(-${currentIndex * 100
                            }% + ${dragOffset}px))`,
                        transition: isDragging ? "none" : "transform 0.5s ease-in-out",
                    }}
                >
                    {items.map((item, index) => (
                        <div key={index} className="carousel-slide">
                            {item}
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={goToNext}
                disabled={currentIndex >= maxIndex}
                className="carousel-btn"
            >
                <div>&gt;</div>
            </button>

            <div className="carousel-indicators">
                {items.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`carousel-dot ${currentIndex === index ? "active" : ""}`}
                        aria-label={`Vai alla slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Carousel;