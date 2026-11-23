const Moonfig = () => {
  return (
    <div className='fall-orb fall-moon'>
      {/* soft blue halo */}
      <div className='pointer-events-none absolute -inset-[14%] rounded-full bg-[radial-gradient(circle,rgba(170,205,255,.45)_45%,transparent_72%)] blur-[6px]' />

      {/* sphere: blue-white shading, clipped round */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden rounded-full bg-[radial-gradient(circle_at_34%_30%,#f7fbff_0%,#e3eefa_38%,#c3d7ee_75%,#a9c1e0_100%)]'>
        {/* maria: the big soft blue-grey patches */}
        <div className='absolute left-[36%] top-[12%] h-[32%] w-[36%] rounded-[55%_45%_60%_40%] bg-[#8fadd0]/45 blur-[2px]' />
        <div className='absolute left-[64%] top-[24%] h-[26%] w-[22%] rounded-[45%_55%_40%_60%] bg-[#93b0d3]/40 blur-[2px]' />
        <div className='absolute left-[22%] top-[46%] h-[24%] w-[32%] rounded-[60%_40%_55%_45%] bg-[#9ab6d8]/40 blur-[2px]' />
        <div className='absolute left-[54%] top-[58%] h-[24%] w-[28%] rounded-[50%] bg-[#a3bddd]/35 blur-[3px]' />
        <div className='absolute left-[14%] top-[26%] h-[14%] w-[16%] rounded-full bg-[#a8c1df]/35 blur-[2px]' />

        {/* craters: small pits with a lit rim and a shaded rim */}
        <div className='absolute left-[46%] top-[20%] h-[9%] w-[9%] rounded-full bg-[#aac2e0]/60 shadow-[inset_1px_1px_1px_rgba(255,255,255,.7),inset_-1px_-1px_2px_rgba(80,115,170,.4)]' />
        <div className='absolute left-[68%] top-[34%] h-[7%] w-[7%] rounded-full bg-[#aac2e0]/60 shadow-[inset_1px_1px_1px_rgba(255,255,255,.7),inset_-1px_-1px_2px_rgba(80,115,170,.4)]' />
        <div className='absolute left-[30%] top-[54%] h-[10%] w-[10%] rounded-full bg-[#a5bede]/60 shadow-[inset_1px_1px_1px_rgba(255,255,255,.7),inset_-1px_-1px_2px_rgba(80,115,170,.4)]' />
        <div className='absolute left-[58%] top-[66%] h-[6%] w-[6%] rounded-full bg-[#aac2e0]/60 shadow-[inset_1px_1px_1px_rgba(255,255,255,.7),inset_-1px_-1px_2px_rgba(80,115,170,.4)]' />
        <div className='absolute left-[40%] top-[76%] h-[5%] w-[5%] rounded-full bg-[#aac2e0]/60 shadow-[inset_1px_1px_1px_rgba(255,255,255,.7),inset_-1px_-1px_2px_rgba(80,115,170,.4)]' />
        <div className='absolute left-[76%] top-[52%] h-[5%] w-[5%] rounded-full bg-[#aac2e0]/60 shadow-[inset_1px_1px_1px_rgba(255,255,255,.7),inset_-1px_-1px_2px_rgba(80,115,170,.4)]' />

        {/* bright lower-left highlight like the photo, then edge darkening and a thin rim light */}
        <div className='absolute inset-0 rounded-full bg-[radial-gradient(circle_at_28%_72%,rgba(255,255,255,.55),transparent_42%)]' />
        <div className='absolute inset-0 rounded-full bg-[radial-gradient(circle,transparent_58%,rgba(110,150,205,.4)_100%)]' />
        <div className='absolute inset-0 rounded-full shadow-[inset_0_0_6px_1px_rgba(255,255,255,.55)]' />
      </div>
    </div>
  )
}

export default Moonfig
