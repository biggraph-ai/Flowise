// ==============================|| LOGO ||============================== //

const Logo = () => {
    const logoUrl = 'https://biggraph.ai/assets/logo.svg'

    return (
        <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'row', marginLeft: '10px' }}>
            <img
                style={{ objectFit: 'contain', height: 'auto', width: 150 }}
                src={logoUrl}
                alt='BrigGraphAI'
            />
        </div>
    )
}

export default Logo
