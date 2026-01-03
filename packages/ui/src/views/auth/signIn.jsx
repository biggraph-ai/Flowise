import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'

// material-ui
import { Stack, Typography, Box, Alert, Button, Divider, Icon } from '@mui/material'
import { IconExclamationCircle } from '@tabler/icons-react'
import { LoadingButton } from '@mui/lab'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import { Input } from '@/ui-component/input/Input'

// Hooks
import useApi from '@/hooks/useApi'
import { useConfig } from '@/store/context/ConfigContext'
import { useError } from '@/store/context/ErrorContext'

// API
import authApi from '@/api/auth'
import accountApi from '@/api/account.api'
import loginMethodApi from '@/api/loginmethod'
import ssoApi from '@/api/sso'

// utils
import useNotifier from '@/utils/useNotifier'

// store
import { loginSuccess, logoutSuccess } from '@/store/reducers/authSlice'
import { store } from '@/store'

// icons
import AzureSSOLoginIcon from '@/assets/images/microsoft-azure.svg'
import GoogleSSOLoginIcon from '@/assets/images/google.svg'
import Auth0SSOLoginIcon from '@/assets/images/auth0.svg'
import GithubSSOLoginIcon from '@/assets/images/github.svg'

// ==============================|| SignInPage ||============================== //

const SignInPage = () => {
    useSelector((state) => state.customization)
    useNotifier()
    const { isEnterpriseLicensed, isCloud, isOpenSource } = useConfig()

    const usernameInput = {
        label: 'Username',
        name: 'username',
        type: 'email',
        placeholder: 'user@company.com'
    }
    const passwordInput = {
        label: 'Password',
        name: 'password',
        type: 'password',
        placeholder: '********'
    }
    const [usernameVal, setUsernameVal] = useState('')
    const [passwordVal, setPasswordVal] = useState('')
    const [configuredSsoProviders, setConfiguredSsoProviders] = useState([])
    const [authError, setAuthError] = useState(undefined)
    const [loading, setLoading] = useState(false)
    const [showResendButton, setShowResendButton] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    const { authRateLimitError, setAuthRateLimitError } = useError()

    const loginApi = useApi(authApi.login)
    const ssoLoginApi = useApi(ssoApi.ssoLogin)
    const getDefaultProvidersApi = useApi(loginMethodApi.getDefaultLoginMethods)
    const navigate = useNavigate()
    const location = useLocation()
    const resendVerificationApi = useApi(accountApi.resendVerificationEmail)

    const doLogin = (event) => {
        event.preventDefault()
        setAuthRateLimitError(null)
        setLoading(true)
        const body = {
            email: usernameVal,
            password: passwordVal
        }
        loginApi.request(body)
    }

    useEffect(() => {
        if (loginApi.error) {
            setLoading(false)
            if (loginApi.error.response.status === 401 && loginApi.error.response.data.redirectUrl) {
                window.location.href = loginApi.error.response.data.data.redirectUrl
            } else {
                setAuthError(loginApi.error.response.data.message)
            }
        }
    }, [loginApi.error])

    useEffect(() => {
        store.dispatch(logoutSuccess())
        setAuthRateLimitError(null)
        if (!isOpenSource) {
            getDefaultProvidersApi.request()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setAuthRateLimitError, isOpenSource])

    useEffect(() => {
        // Parse the "user" query parameter from the URL
        const queryParams = new URLSearchParams(location.search)
        const errorData = queryParams.get('error')
        if (!errorData) return
        const parsedErrorData = JSON.parse(decodeURIComponent(errorData))
        setAuthError(parsedErrorData.message)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search])

    useEffect(() => {
        if (loginApi.data) {
            setLoading(false)
            store.dispatch(loginSuccess(loginApi.data))
            navigate(location.state?.path || '/')
            //navigate(0)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loginApi.data])

    useEffect(() => {
        if (ssoLoginApi.data) {
            store.dispatch(loginSuccess(ssoLoginApi.data))
            navigate(location.state?.path || '/')
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ssoLoginApi.data])

    useEffect(() => {
        if (ssoLoginApi.error) {
            if (ssoLoginApi.error?.response?.status === 401 && ssoLoginApi.error?.response?.data.redirectUrl) {
                window.location.href = ssoLoginApi.error.response.data.redirectUrl
            } else {
                setAuthError(ssoLoginApi.error.message)
            }
        }
    }, [ssoLoginApi.error])

    useEffect(() => {
        if (getDefaultProvidersApi.data && getDefaultProvidersApi.data.providers) {
            //data is an array of objects, store only the provider attribute
            setConfiguredSsoProviders(getDefaultProvidersApi.data.providers.map((provider) => provider))
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getDefaultProvidersApi.data])

    useEffect(() => {
        if (authError === 'User Email Unverified') {
            setShowResendButton(true)
        } else {
            setShowResendButton(false)
        }
    }, [authError])

    const signInWithSSO = (ssoProvider) => {
        window.location.href = `/api/v1/${ssoProvider}/login`
    }

    const handleResendVerification = async () => {
        try {
            await resendVerificationApi.request({ email: usernameVal })
            setAuthError(undefined)
            setSuccessMessage('Verification email has been sent successfully.')
            setShowResendButton(false)
        } catch (error) {
            setAuthError(error.response?.data?.message || 'Failed to send verification email.')
        }
    }

    return (
        <>
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: { xs: 3, md: 6 },
                    color: 'rgba(255,255,255,0.92)',
                    background:
                        'radial-gradient(1200px 800px at 18% 12%, rgba(68,163,255,.30), transparent 55%), radial-gradient(900px 700px at 85% 25%, rgba(138,125,255,.28), transparent 55%), radial-gradient(850px 650px at 60% 95%, rgba(255,79,216,.18), transparent 55%), linear-gradient(180deg, #0a0d14, #0b1220)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        opacity: 0.55,
                        pointerEvents: 'none',
                        mixBlendMode: 'overlay',
                        backgroundImage:
                            "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"160\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\".85\" numOctaves=\"3\" stitchTiles=\"stitch\"/></filter><rect width=\"160\" height=\"160\" filter=\"url(%23n)\" opacity=\".06\"/></svg>')"
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: -1,
                        opacity: 0.22,
                        pointerEvents: 'none',
                        background:
                            'linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)',
                        backgroundSize: '46px 46px',
                        maskImage: 'radial-gradient(700px 500px at 50% 25%, rgba(0,0,0,1), transparent 70%)'
                    }
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: 1100,
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1.08fr 0.92fr' },
                        gap: 3,
                        alignItems: 'start',
                        position: 'relative',
                        zIndex: 1
                    }}
                >
                    <Box
                        sx={{
                            borderRadius: '22px',
                            border: '1px solid rgba(255,255,255,.10)',
                            background: 'linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.035))',
                            boxShadow: '0 14px 40px rgba(0,0,0,.35)',
                            padding: { xs: 3, md: 4 },
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <Box
                            sx={{
                                content: '""',
                                position: 'absolute',
                                inset: -2,
                                background:
                                    'radial-gradient(800px 320px at 20% 18%, rgba(68,163,255,.30), transparent 62%), radial-gradient(700px 300px at 85% 24%, rgba(138,125,255,.26), transparent 60%), radial-gradient(600px 260px at 65% 80%, rgba(255,79,216,.16), transparent 62%)',
                                opacity: 0.75,
                                pointerEvents: 'none'
                            }}
                        />
                        <Stack spacing={2} sx={{ position: 'relative' }}>
                            <Box
                                component='img'
                                src='/logo.svg'
                                alt='BigGraph AI logo'
                                sx={{ width: 215, height: 215, objectFit: 'contain' }}
                            />
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    padding: '10px 12px',
                                    borderRadius: '999px',
                                    border: '1px solid rgba(255,255,255,.14)',
                                    background: 'rgba(0,0,0,.18)',
                                    color: 'rgba(255,255,255,.80)',
                                    fontWeight: 650,
                                    fontSize: 13
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(180deg, #4dd7ff, #0a84ff)',
                                        boxShadow: '0 0 0 4px rgba(77,215,255,.14)'
                                    }}
                                />
                                BigGraph AI • Graph-native intelligence
                            </Box>
                            <Typography variant='h2' sx={{ fontWeight: 700, fontSize: { xs: 32, md: 42 }, letterSpacing: '-0.04em' }}>
                                Turn connected data into decisions—fast.
                            </Typography>
                            <Typography variant='body1' sx={{ color: 'rgba(255,255,255,.68)', lineHeight: 1.55 }}>
                                BigGraph AI helps teams explore relationships, detect patterns, and build trustworthy AI workflows on top of
                                graph data. Designed with an Apple-like focus on clarity, speed, and beautiful simplicity.
                            </Typography>
                            <Stack direction='row' spacing={1.5} flexWrap='wrap'>
                                <Button
                                    component={Link}
                                    to='/register'
                                    sx={{
                                        height: 46,
                                        px: 2,
                                        borderRadius: '14px',
                                        fontWeight: 750,
                                        textTransform: 'none',
                                        color: '#fff',
                                        background: 'linear-gradient(180deg, #44a3ff, #0a84ff)',
                                        boxShadow: '0 16px 34px rgba(10,132,255,.28)',
                                        '&:hover': {
                                            background: 'linear-gradient(180deg, #44a3ff, #0a84ff)',
                                            boxShadow: '0 18px 40px rgba(10,132,255,.34)'
                                        }
                                    }}
                                >
                                    Create an account
                                </Button>
                                <Button
                                    component={Link}
                                    to='/signin'
                                    sx={{
                                        height: 46,
                                        px: 2,
                                        borderRadius: '14px',
                                        border: '1px solid rgba(255,255,255,.14)',
                                        background: 'rgba(255,255,255,.06)',
                                        color: 'rgba(255,255,255,.88)',
                                        fontWeight: 750,
                                        textTransform: 'none',
                                        '&:hover': {
                                            background: 'rgba(255,255,255,.08)',
                                            borderColor: 'rgba(255,255,255,.20)'
                                        }
                                    }}
                                >
                                    Sign in
                                </Button>
                            </Stack>
                            <Stack spacing={1.5}>
                                {[
                                    {
                                        title: 'Instant insights',
                                        text: 'with fast search and relationship traversal across your data graph.'
                                    },
                                    {
                                        title: 'Explainable results',
                                        text: '—see why the system recommends a path, entity, or cluster.'
                                    },
                                    {
                                        title: 'Security-first',
                                        text: '—principled access, auditable actions, and privacy by design.'
                                    }
                                ].map((item) => (
                                    <Stack direction='row' spacing={1.5} key={item.title} sx={{ color: 'rgba(255,255,255,.80)' }}>
                                        <Box
                                            sx={{
                                                width: 22,
                                                height: 22,
                                                borderRadius: '8px',
                                                display: 'grid',
                                                placeItems: 'center',
                                                background: 'rgba(255,255,255,.07)',
                                                border: '1px solid rgba(255,255,255,.12)',
                                                flex: 'none'
                                            }}
                                        >
                                            <Box
                                                component='span'
                                                sx={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                    background: 'rgba(255,255,255,.85)'
                                                }}
                                            />
                                        </Box>
                                        <Typography variant='body2'>
                                            <strong>{item.title}</strong> {item.text}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Stack>
                    </Box>
                    <MainCard
                        sx={{
                            width: '100%',
                            borderRadius: '22px',
                            border: '1px solid rgba(255,255,255,.10)',
                            background: 'linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04))',
                            boxShadow: '0 30px 90px rgba(0,0,0,.55)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                inset: -2,
                                background: 'radial-gradient(700px 240px at 50% 0%, rgba(255,255,255,.20), transparent 70%)',
                                opacity: 0.75,
                                pointerEvents: 'none'
                            }
                        }}
                    >
                        <Stack flexDirection='column' sx={{ gap: 3, position: 'relative' }}>
                        <Stack
                            direction='row'
                            spacing={1}
                            sx={{
                                p: 1,
                                borderRadius: '16px',
                                borderBottom: '1px solid rgba(255,255,255,.10)',
                                background: 'rgba(0,0,0,.12)'
                            }}
                        >
                            <Button
                                component={Link}
                                to='/register'
                                sx={{
                                    flex: 1,
                                    height: 40,
                                    borderRadius: '14px',
                                    border: '1px solid rgba(255,255,255,.12)',
                                    background: 'rgba(255,255,255,.04)',
                                    color: 'rgba(255,255,255,.82)',
                                    fontWeight: 750,
                                    textTransform: 'none',
                                    '&:hover': {
                                        background: 'rgba(255,255,255,.08)',
                                        borderColor: 'rgba(255,255,255,.18)'
                                    }
                                }}
                            >
                                Sign up
                            </Button>
                            <Button
                                disabled
                                sx={{
                                    flex: 1,
                                    height: 40,
                                    borderRadius: '14px',
                                    border: '1px solid rgba(10,132,255,.32)',
                                    background: 'rgba(10,132,255,.18)',
                                    color: 'rgba(255,255,255,.92)',
                                    fontWeight: 750,
                                    textTransform: 'none',
                                    opacity: 1
                                }}
                            >
                                Sign in
                            </Button>
                        </Stack>
                        {successMessage && (
                            <Alert variant='filled' severity='success' onClose={() => setSuccessMessage('')}>
                                {successMessage}
                            </Alert>
                        )}
                        {authRateLimitError && (
                            <Alert icon={<IconExclamationCircle />} variant='filled' severity='error'>
                                {authRateLimitError}
                            </Alert>
                        )}
                        {authError && (
                            <Alert icon={<IconExclamationCircle />} variant='filled' severity='error'>
                                {authError}
                            </Alert>
                        )}
                        {showResendButton && (
                            <Stack sx={{ gap: 1 }}>
                                <Button variant='text' onClick={handleResendVerification} sx={{ color: 'rgba(255,255,255,.86)' }}>
                                    Resend Verification Email
                                </Button>
                            </Stack>
                        )}
                        <Stack sx={{ gap: 1 }}>
                            <Typography variant='h2' sx={{ color: 'rgba(255,255,255,.92)', fontWeight: 700 }}>
                                Welcome back
                            </Typography>
                            {isCloud && (
                                <Typography variant='body2' sx={{ color: 'rgba(255,255,255,.68)' }}>
                                    Don&apos;t have an account?{' '}
                                    <Link style={{ color: 'rgba(255,255,255,.92)' }} to='/register'>
                                        Sign up for free
                                    </Link>
                                    .
                                </Typography>
                            )}
                            {isEnterpriseLicensed && (
                                <Typography variant='body2' sx={{ color: 'rgba(255,255,255,.68)' }}>
                                    Have an invite code?{' '}
                                    <Link style={{ color: 'rgba(255,255,255,.92)' }} to='/register'>
                                        Sign up for an account
                                    </Link>
                                    .
                                </Typography>
                            )}
                        </Stack>
                        <form onSubmit={doLogin}>
                            <Stack
                                sx={{
                                    width: '100%',
                                    flexDirection: 'column',
                                    alignItems: 'left',
                                    justifyContent: 'center',
                                    gap: 2,
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(0,0,0,.18)',
                                        borderRadius: '14px',
                                        color: 'rgba(255,255,255,.92)'
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(255,255,255,.14)'
                                    },
                                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(255,255,255,.2)'
                                    },
                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(10,132,255,.55)'
                                    },
                                    '& input::placeholder': {
                                        color: 'rgba(255,255,255,.42)'
                                    }
                                }}
                            >
                                <Box sx={{ p: 0 }}>
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        <Typography sx={{ color: 'rgba(255,255,255,.82)', fontWeight: 650 }}>
                                            Email<span style={{ color: '#ff453a' }}>&nbsp;*</span>
                                        </Typography>
                                        <div style={{ flexGrow: 1 }}></div>
                                    </div>
                                    <Input
                                        inputParam={usernameInput}
                                        onChange={(newValue) => setUsernameVal(newValue)}
                                        value={usernameVal}
                                        showDialog={false}
                                    />
                                </Box>
                                <Box sx={{ p: 0 }}>
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        <Typography sx={{ color: 'rgba(255,255,255,.82)', fontWeight: 650 }}>
                                            Password<span style={{ color: '#ff453a' }}>&nbsp;*</span>
                                        </Typography>
                                        <div style={{ flexGrow: 1 }}></div>
                                    </div>
                                    <Input
                                        inputParam={passwordInput}
                                        onChange={(newValue) => setPasswordVal(newValue)}
                                        value={passwordVal}
                                    />
                                    <Typography variant='body2' sx={{ color: 'rgba(255,255,255,.66)', mt: 1, textAlign: 'right' }}>
                                        <Link style={{ color: 'rgba(255,255,255,.86)' }} to='/forgot-password'>
                                            Forgot password?
                                        </Link>
                                    </Typography>
                                </Box>
                                <LoadingButton
                                    loading={loading}
                                    variant='contained'
                                    sx={{
                                        borderRadius: '14px',
                                        height: 48,
                                        mt: 1,
                                        fontWeight: 800,
                                        textTransform: 'none',
                                        background: 'linear-gradient(180deg, #44a3ff, #0a84ff)',
                                        boxShadow: '0 16px 34px rgba(10,132,255,.26)',
                                        '&:hover': {
                                            background: 'linear-gradient(180deg, #44a3ff, #0a84ff)',
                                            boxShadow: '0 18px 40px rgba(10,132,255,.34)'
                                        }
                                    }}
                                    type='submit'
                                >
                                    Sign In
                                </LoadingButton>
                                {configuredSsoProviders && configuredSsoProviders.length > 0 && (
                                    <Divider sx={{ width: '100%', color: 'rgba(255,255,255,.6)' }}>OR</Divider>
                                )}
                                {configuredSsoProviders &&
                                    configuredSsoProviders.map(
                                        (ssoProvider) =>
                                            //https://learn.microsoft.com/en-us/entra/identity-platform/howto-add-branding-in-apps
                                            ssoProvider === 'azure' && (
                                                <Button
                                                    key={ssoProvider}
                                                    variant='outlined'
                                                    sx={{
                                                        borderRadius: '14px',
                                                        height: 46,
                                                        borderColor: 'rgba(255,255,255,.18)',
                                                        color: 'rgba(255,255,255,.86)',
                                                        textTransform: 'none',
                                                        '&:hover': {
                                                            borderColor: 'rgba(255,255,255,.3)',
                                                            background: 'rgba(255,255,255,.06)'
                                                        }
                                                    }}
                                                    onClick={() => signInWithSSO(ssoProvider)}
                                                    startIcon={
                                                        <Icon>
                                                            <img src={AzureSSOLoginIcon} alt={'MicrosoftSSO'} width={20} height={20} />
                                                        </Icon>
                                                    }
                                                >
                                                    Sign In With Microsoft
                                                </Button>
                                            )
                                    )}
                                {configuredSsoProviders &&
                                    configuredSsoProviders.map(
                                        (ssoProvider) =>
                                            ssoProvider === 'google' && (
                                                <Button
                                                    key={ssoProvider}
                                                    variant='outlined'
                                                    sx={{
                                                        borderRadius: '14px',
                                                        height: 46,
                                                        borderColor: 'rgba(255,255,255,.18)',
                                                        color: 'rgba(255,255,255,.86)',
                                                        textTransform: 'none',
                                                        '&:hover': {
                                                            borderColor: 'rgba(255,255,255,.3)',
                                                            background: 'rgba(255,255,255,.06)'
                                                        }
                                                    }}
                                                    onClick={() => signInWithSSO(ssoProvider)}
                                                    startIcon={
                                                        <Icon>
                                                            <img src={GoogleSSOLoginIcon} alt={'GoogleSSO'} width={20} height={20} />
                                                        </Icon>
                                                    }
                                                >
                                                    Sign In With Google
                                                </Button>
                                            )
                                    )}
                                {configuredSsoProviders &&
                                    configuredSsoProviders.map(
                                        (ssoProvider) =>
                                            ssoProvider === 'auth0' && (
                                                <Button
                                                    key={ssoProvider}
                                                    variant='outlined'
                                                    sx={{
                                                        borderRadius: '14px',
                                                        height: 46,
                                                        borderColor: 'rgba(255,255,255,.18)',
                                                        color: 'rgba(255,255,255,.86)',
                                                        textTransform: 'none',
                                                        '&:hover': {
                                                            borderColor: 'rgba(255,255,255,.3)',
                                                            background: 'rgba(255,255,255,.06)'
                                                        }
                                                    }}
                                                    onClick={() => signInWithSSO(ssoProvider)}
                                                    startIcon={
                                                        <Icon>
                                                            <img src={Auth0SSOLoginIcon} alt={'Auth0SSO'} width={20} height={20} />
                                                        </Icon>
                                                    }
                                                >
                                                    Sign In With Auth0 by Okta
                                                </Button>
                                            )
                                    )}
                                {configuredSsoProviders &&
                                    configuredSsoProviders.map(
                                        (ssoProvider) =>
                                            ssoProvider === 'github' && (
                                                <Button
                                                    key={ssoProvider}
                                                    variant='outlined'
                                                    sx={{
                                                        borderRadius: '14px',
                                                        height: 46,
                                                        borderColor: 'rgba(255,255,255,.18)',
                                                        color: 'rgba(255,255,255,.86)',
                                                        textTransform: 'none',
                                                        '&:hover': {
                                                            borderColor: 'rgba(255,255,255,.3)',
                                                            background: 'rgba(255,255,255,.06)'
                                                        }
                                                    }}
                                                    onClick={() => signInWithSSO(ssoProvider)}
                                                    startIcon={
                                                        <Icon>
                                                            <img src={GithubSSOLoginIcon} alt={'GithubSSO'} width={20} height={20} />
                                                        </Icon>
                                                    }
                                                >
                                                    Sign In With Github
                                                </Button>
                                            )
                                    )}
                            </Stack>
                        </form>
                    </Stack>
                </MainCard>
            </Box>
        </Box>
        </>
    )
}

export default SignInPage
