import './style.css'
import Img from './loading.png'
export const Loading=()=>{
  return <div className='loading-box-wrapper'>
    <div className='loading-box'>
    <img src={Img} alt="" />
  </div>
    <p className='text'>加载中 ，请稍等 · · · </p>
  </div>
}