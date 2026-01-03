import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// material-ui
import { Alert, Box, Button, Stack, Typography } from '@mui/material'

// project imports
import { StyledButton } from '@/ui-component/button/StyledButton'
import MainCard from '@/ui-component/cards/MainCard'
import { Input } from '@/ui-component/input/Input'
import { BackdropLoader } from '@/ui-component/loading/BackdropLoader'

// API
import accountApi from '@/api/account.api'

// Hooks
import useApi from '@/hooks/useApi'
import { useConfig } from '@/store/context/ConfigContext'
import { useError } from '@/store/context/ErrorContext'

// utils
import useNotifier from '@/utils/useNotifier'

// Icons
import { IconCircleCheck, IconExclamationCircle } from '@tabler/icons-react'

// ==============================|| ForgotPasswordPage ||============================== //

const ForgotPasswordPage = () => {
    useNotifier()

    const usernameInput = {
        label: 'Username',
        name: 'username',
        type: 'email',
        placeholder: 'user@company.com'
    }
    const [usernameVal, setUsernameVal] = useState('')
    const { isEnterpriseLicensed } = useConfig()

    const [isLoading, setLoading] = useState(false)
    const [responseMsg, setResponseMsg] = useState(undefined)

    const { authRateLimitError, setAuthRateLimitError } = useError()

    const forgotPasswordApi = useApi(accountApi.forgotPassword)

    const sendResetRequest = async (event) => {
        event.preventDefault()
        setAuthRateLimitError(null)
        const body = {
            user: {
                email: usernameVal
            }
        }
        setLoading(true)
        await forgotPasswordApi.request(body)
    }

    useEffect(() => {
        setAuthRateLimitError(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setAuthRateLimitError])

    useEffect(() => {
        if (forgotPasswordApi.error) {
            const errMessage =
                typeof forgotPasswordApi.error.response.data === 'object'
                    ? forgotPasswordApi.error.response.data.message
                    : forgotPasswordApi.error.response.data
            setResponseMsg({
                type: 'error',
                msg: errMessage ?? 'Failed to send instructions, please contact your administrator.'
            })
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forgotPasswordApi.error])

    useEffect(() => {
        if (forgotPasswordApi.data) {
            setResponseMsg({
                type: 'success',
                msg: 'Password reset instructions sent to the email.'
            })
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forgotPasswordApi.data])

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
                            {responseMsg && responseMsg?.type === 'error' && (
                                <Alert icon={<IconExclamationCircle />} variant='filled' severity='error'>
                                    {responseMsg.msg}
                                </Alert>
                            )}
                            {authRateLimitError && (
                                <Alert icon={<IconExclamationCircle />} variant='filled' severity='error'>
                                    {authRateLimitError}
                                </Alert>
                            )}
                            {responseMsg && responseMsg?.type !== 'error' && (
                                <Alert icon={<IconCircleCheck />} variant='filled' severity='success'>
                                    {responseMsg.msg}
                                </Alert>
                            )}
                            <Stack sx={{ gap: 1 }}>
                                <Typography variant='h2' sx={{ color: 'rgba(255,255,255,.92)', fontWeight: 700 }}>
                                    Forgot your password?
                                </Typography>
                                <Typography variant='body2' sx={{ color: 'rgba(255,255,255,.68)' }}>
                                    Have a reset password code?{' '}
                                    <Link style={{ color: 'rgba(255,255,255,.92)' }} to='/reset-password'>
                                        Change your password here
                                    </Link>
                                    .
                                </Typography>
                            </Stack>
                            <form onSubmit={sendResetRequest}>
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
                                    <Box>
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            <Typography sx={{ color: 'rgba(255,255,255,.82)', fontWeight: 650 }}>
                                                Email<span style={{ color: '#ff453a' }}>&nbsp;*</span>
                                            </Typography>
                                            <Typography align='left'></Typography>
                                            <div style={{ flexGrow: 1 }}></div>
                                        </div>
                                        <Input
                                            inputParam={usernameInput}
                                            onChange={(newValue) => setUsernameVal(newValue)}
                                            value={usernameVal}
                                            showDialog={false}
                                        />
                                        {isEnterpriseLicensed && (
                                            <Typography variant='caption' sx={{ color: 'rgba(255,255,255,.58)' }}>
                                                <i>If you forgot the email you used for signing up, please contact your administrator.</i>
                                            </Typography>
                                        )}
                                    </Box>
                                    <StyledButton
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
                                        disabled={!usernameVal}
                                        type='submit'
                                    >
                                        Send Reset Password Instructions
                                    </StyledButton>
                                </Stack>
                            </form>
                            <BackdropLoader open={isLoading} />
                        </Stack>
                    </MainCard>
                </Box>
            </Box>
        </>
    )
}

export default ForgotPasswordPage
