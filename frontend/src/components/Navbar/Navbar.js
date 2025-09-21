import React, { Fragment, useState, useCallback } from 'react'
import './Navbar.css'
import myntra from '../images/myntra.svg'
import { FaRegUser } from 'react-icons/fa'
import { BsHeart } from 'react-icons/bs'
import { BsHandbag } from 'react-icons/bs'
import Search from './Search.js'
import Men from './Submenu/Men'
import Women from './Submenu/Women'
import Kids from './Submenu/Kids'
import Home from './Submenu/Home'
import Beauty from './Submenu/Beauty'
import Studio from './Submenu/Studio'
import Profile from './Submenu/Profile'
import { Link } from 'react-router-dom'

const Navbar = ({ user }) => {
  // Menu visibility states
  const [menuStates, setMenuStates] = useState({
    men: { visible: 'hidden', show: false },
    women: { visible: 'hidden', show: false },
    kids: { visible: 'hidden', show: false },
    home: { visible: 'hidden', show: false },
    beauty: { visible: 'hidden', show: false },
    studio: { visible: 'hidden', show: false },
    profile: { visible: 'hidden', show: false }
  })

  // Generic callback for menu state management
  const handleMenuToggle = useCallback((menuType, visible, show) => {
    setMenuStates(prev => ({
      ...prev,
      [menuType]: { visible, show }
    }))
  }, [])

  // Specific callbacks for each menu
  const menCallback = useCallback((visible, show) => {
    handleMenuToggle('men', visible, show)
  }, [handleMenuToggle])

  const womenCallback = useCallback((visible, show) => {
    handleMenuToggle('women', visible, show)
  }, [handleMenuToggle])

  const kidsCallback = useCallback((visible, show) => {
    handleMenuToggle('kids', visible, show)
  }, [handleMenuToggle])

  const homeCallback = useCallback((visible, show) => {
    handleMenuToggle('home', visible, show)
  }, [handleMenuToggle])

  const beautyCallback = useCallback((visible, show) => {
    handleMenuToggle('beauty', visible, show)
  }, [handleMenuToggle])

  const studioCallback = useCallback((visible, show) => {
    handleMenuToggle('studio', visible, show)
  }, [handleMenuToggle])

  const profileCallback = useCallback((visible, show) => {
    handleMenuToggle('profile', visible, show)
  }, [handleMenuToggle])

  return (
    <Fragment>
      <div className="container sticky top-0 2xl:w-[100%] xl:w-[100%] lg:w-[100%] mx-auto max-w-[100%] h-[80px] bg-[#fff] contenthide z-10">
        <div className='2xl:grid xl:grid grid-cols-2 lg:flex h-full mx-6'>
          
          {/* Left side - Logo and Navigation */}
          <ul className='h-full flex font1 font-semibold text-base md:text-[14px] text-[#282c3f] tracking-[.3px] uppercase'>
            <Link className='w-max px-3 flex items-stretch' to="/">
              <li className='w-max flex items-stretch'>
                <img src={myntra} alt="Myntra Logo" className='w-14' />
              </li>
            </Link>
            
            <Link className='w-max px-3 flex items-stretch' to="/">
              <li 
                className='w-max flex justify-center items-center border-4 border-transparent cborder1'
                onMouseEnter={() => handleMenuToggle('men', 'block', true)} 
                onMouseLeave={() => handleMenuToggle('men', 'hidden', false)}
              >
                <h1 className='px-3'>MEN</h1>
              </li>
            </Link>
            
            <li 
              className='w-max flex justify-center items-center border-4 border-transparent cborder2'
              onMouseEnter={() => handleMenuToggle('women', 'block', true)} 
              onMouseLeave={() => handleMenuToggle('women', 'hidden', false)}
            >
              <h1 className='px-3'>WOMEN</h1>
            </li>
            
            <li 
              className='w-max flex justify-center items-center border-4 border-transparent cborder3'
              onMouseEnter={() => handleMenuToggle('kids', 'block', true)} 
              onMouseLeave={() => handleMenuToggle('kids', 'hidden', false)}
            >
              <h1 className='px-3'>KIDS</h1>
            </li>
            
            <li 
              className='w-46 flex justify-center items-center border-4 border-transparent cborder4'
              onMouseEnter={() => handleMenuToggle('home', 'block', true)} 
              onMouseLeave={() => handleMenuToggle('home', 'hidden', false)}
            >
              <h1 className='px-3'>HOME&nbsp;&&nbsp;LIVING</h1>
            </li>
            
            <li 
              className='w-max flex justify-center items-center border-4 border-transparent cborder5'
              onMouseEnter={() => handleMenuToggle('beauty', 'block', true)} 
              onMouseLeave={() => handleMenuToggle('beauty', 'hidden', false)}
            >
              <h1 className='px-3'>BEAUTY</h1>
            </li>
            
            <li 
              className='w-max flex justify-center items-center border-4 border-transparent cborder6'
              onMouseEnter={() => handleMenuToggle('studio', 'block', true)} 
              onMouseLeave={() => handleMenuToggle('studio', 'hidden', false)}
            >
              <h1 className='px-3 relative'>
                STUDIO
                <span className='text-[#fb56c1] text-[10px] absolute -top-1/2'>new</span>
              </h1>
            </li>
          </ul>

          {/* Right side - Search and User Actions */}
          <div className='h-full justify-center items-center'>
            <ul className='flex float-right h-full text-[#282c3f] tracking-[.3px] sent'>
              <li className='mr-6'>
                <Search />
              </li>
              
              <li 
                className='w-max flex justify-center items-center font1 font-semibold capitalize no-underline text-sm border-4 border-transparent cborder1'
                onMouseEnter={() => handleMenuToggle('profile', 'block', true)} 
                onMouseLeave={() => handleMenuToggle('profile', 'hidden', false)}
              >
                <h1 className='px-3 text-center text-xs relative'>
                  <span className='text-lg block absolute -top-5 left-1/3'>
                    <FaRegUser />
                  </span>
                  <span className='block'>Profile</span>
                </h1>
              </li>
              
              <li className='w-max flex justify-center items-center font1 font-semibold capitalize no-underline text-sm border-4 border-transparent'>
                <Link to='/my_wishlist'>
                  <h1 className='px-3 text-xs text-center relative'>
                    <span className='text-lg absolute -top-5 left-1/3'>
                      <BsHeart />
                    </span>
                    Wishlist
                  </h1>
                </Link>
              </li>
              
              <li className='w-max flex justify-center items-center font1 font-semibold capitalize no-underline text-sm border-4 border-transparent'>
                <Link to='/ai_wishlist'>
                  <h1 className='px-3 text-xs text-center relative'>
                    <span className='text-lg absolute -top-5 left-1/3'>🤖</span>
                    AI Compare
                  </h1>
                </Link>
              </li>
              
              <li className='w-max flex justify-center items-center font1 font-semibold capitalize no-underline text-sm border-4 border-transparent'>
                <Link to='/bag'>
                  <h1 className='px-3 text-xs text-center relative'>
                    <span className='text-lg absolute -top-5 left-1/3'>
                      <BsHandbag />
                    </span>
                    Bag
                  </h1>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Submenu Components */}
        <Men 
          show={menuStates.men.show} 
          CMenu={menuStates.men.visible} 
          parentCallback={menCallback} 
        />
        <Women 
          show={menuStates.women.show} 
          CMenu={menuStates.women.visible} 
          parentCallback={womenCallback} 
        />
        <Kids 
          show={menuStates.kids.show} 
          CMenu={menuStates.kids.visible} 
          parentCallback={kidsCallback} 
        />
        <Home 
          show={menuStates.home.show} 
          CMenu={menuStates.home.visible} 
          parentCallback={homeCallback} 
        />
        <Beauty 
          show={menuStates.beauty.show} 
          CMenu={menuStates.beauty.visible} 
          parentCallback={beautyCallback} 
        />
        <Studio 
          show={menuStates.studio.show} 
          CMenu={menuStates.studio.visible} 
          parentCallback={studioCallback} 
        />
        <Profile 
          user={user}
          show={menuStates.profile.show} 
          CMenu={menuStates.profile.visible} 
          parentCallback={profileCallback} 
        />
      </div>
    </Fragment>
  )
}

export default Navbar