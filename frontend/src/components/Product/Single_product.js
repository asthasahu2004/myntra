import React, { Fragment, useEffect, useCallback } from 'react'
import './Single_product.css'
import { AiFillStar } from 'react-icons/ai'
import { BiRupee } from 'react-icons/bi'
import { IoIosHeartEmpty } from 'react-icons/io'
import { Link } from 'react-router-dom'
import { LazyLoadImage } from 'react-lazy-load-image-component';



const Single_product = ({ pro }) => {


    let slideIndex = 1;

    const currentSlide = (n) => {

        showSlides(slideIndex = n);
    }

    const showSlides = useCallback((n) => {
        // Early return if pro or style_no is not available
        if (!pro || !pro.style_no) return;

        let i;
        let slides = document.getElementsByClassName(pro.style_no);
        let dots = document.getElementsByClassName(`${pro.style_no}1`);

        // Early return if no slides found
        if (slides.length === 0) return;

        if (n > slides.length) { slideIndex = 1 }
        if (n < 1) { slideIndex = slides.length }
        
        for (i = 0; i < slides.length; i++) {
            if (slides[i] && slides[i].style) {
                slides[i].style.display = "none";
            }
        }
        
        for (i = 0; i < dots.length; i++) {
            if (dots[i] && dots[i].className) {
                dots[i].className = dots[i].className.replace(" active", "");
            }
        }

        // Check if the target slide exists before accessing its style
        if (slides[slideIndex - 1] && slides[slideIndex - 1].style) {
            slides[slideIndex - 1].style.display = "block";
        }
        
        // Check if the target dot exists before accessing its className
        if (dots[slideIndex - 1] && dots[slideIndex - 1].className !== undefined) {
            dots[slideIndex - 1].className += " active";
        }
    }, [pro]);

    const showdiv = () => {
        if (!pro?.style_no) return;
        let dotsdiv = document.getElementsByClassName(`${pro.style_no}hover`);
        if (dotsdiv[0]) dotsdiv[0].className += " 2xl:block lg:block xl:block";
    }

    const notshowdiv = () => {
        if (!pro?.style_no) return;
        const element = document.querySelector(`.${pro.style_no}hover`);
        if (element) {
            element.classList.remove('2xl:block')
            element.classList.remove('lg:block')
            element.classList.remove('xl:block')
        }
    }
    // showSlides(slideIndex);
    var timer;

    const changeimg = () => {
        if (!pro?.style_no) return;
        let i = 1;
        timer = setInterval(function () {
            let slides = document.getElementsByClassName(pro.style_no);
            // Check if slides exist before proceeding
            if (slides.length === 0) return;
            
            if (i > slides.length) { i = 0 }
            i++
            currentSlide(i)
        }, 1000);
    }

    function stopchangeimg() {
        clearInterval(timer);
        currentSlide(1)
    }

    useEffect(() => {
        // Only call showSlides if pro and style_no are available
        if (pro && pro.style_no) {
            showSlides(slideIndex);
        }
    }, [pro, slideIndex, showSlides]);

    return (
        <Fragment>
            {
                pro && pro.images && pro.images.length > 0 && pro.images[0].url &&

                <Fragment>
                    <Link to={`/products/${pro._id}`} target='_blank' >
                        <li className=' w-full border-[1px] 
            border-slate-200 grid-cols-1 2xl:border-none xl:border-none lg:border-none 
              relative ' onMouseEnter={() => (showdiv(), changeimg())} onMouseLeave={() => (notshowdiv(), stopchangeimg())}>

                            <div className="slideshow-container min-h-[200px]">

                                {
                                    pro.images.map((im, index) => (

                                        <div key={index} className={`${pro.style_no} fade relative `} >
                                            <LazyLoadImage src={im.url}  className="w-full" width='100%'  alt='product' effect='blur' />
                                            {/* <div className='absolute bottom-2 left-2 bg-white rounded-full px-2 text-[10px] font1 flex py-[2px] items-center'>
                                                3.6&nbsp;<AiFillStar className='text-[#0db7af]' />&nbsp;|&nbsp;2k</div> */}
                                        </div>
                                    ))
                                }

                            </div>

                            <div className='relative pb-6'>
                                <p className='font1 text-base px-2'>{pro.brand || ''}</p>
                                <p className='overflow-hidden px-2 text-xs text-left text-ellipsis h-4 whitespace-nowrap text-slate-400'>{pro.title || ''}</p>
                                <p className=' flex px-2'><span className='flex items-center text-sm font-medium'><BiRupee />{Math.round(pro.sellingPrice || 0)}</span >&nbsp;
                                    <span className='flex items-center text-sm font-medium text-slate-400 line-through'><BiRupee />{Math.round(pro.mrp || 0)}</span>&nbsp;&nbsp;
                                    <span className='flex items-center text-xs font-medium text-[#f26a10]'>( {-Math.round((pro.sellingPrice || 0) / (pro.mrp || 1) * 100 - 100)}% OFF )</span></p>
                            </div>

                            <div className={`${pro.style_no}hover hidden absolute pb-6 bottom-0 w-full bg-[#ffffff]  mx-auto `}>
                                <div className='text-center mb-2'>
                                    {pro.images.map((img, i) => (
                                        <span key={i} className={`${pro.style_no}1 dot `} onClick={() => (currentSlide(i + 1))} ></span>

                                    ))}
                                </div>

                                <div className='w-12/12 text-center flex items-center justify-center py-1 font1 border-[1px] border-slate-300 cursor-pointer' >
                                    <IoIosHeartEmpty className='text-lg mr-1' /><span>WISHLIST</span></div>
                                <div className='relative '>
                                    <p className='font1 text-xm px-2 text-[#5f5f5f9e]'>Sizes: {pro.size || ''}</p>
                                    <p className=' flex px-2'><span className='flex items-center text-sm font-medium'><BiRupee />{Math.round(pro.sellingPrice || 0)}</span >&nbsp;
                                        <span className='flex items-center text-sm font-medium text-slate-400 line-through'><BiRupee />{Math.round(pro.mrp || 0)}</span>&nbsp;&nbsp;
                                        <span className='flex items-center text-xs font-medium text-[#f26a10]'>({Math.round((pro.sellingPrice || 0) / (pro.mrp || 1) * 100 - 100)}% OFF)</span></p>
                                </div>

                            </div>

                        </li>
                    </Link>


                </Fragment>

            }
        </Fragment>

    )
}

export default Single_product