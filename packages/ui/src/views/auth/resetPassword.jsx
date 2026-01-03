import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

// material-ui
import { Alert, Box, Button, OutlinedInput, Stack, Typography } from '@mui/material'

// project imports
import { closeSnackbar as closeSnackbarAction, enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'
import { StyledButton } from '@/ui-component/button/StyledButton'
import MainCard from '@/ui-component/cards/MainCard'
import { Input } from '@/ui-component/input/Input'
import { BackdropLoader } from '@/ui-component/loading/BackdropLoader'

// API
import accountApi from '@/api/account.api'

// utils
import useNotifier from '@/utils/useNotifier'
import { validatePassword } from '@/utils/validation'

// Hooks
import { useError } from '@/store/context/ErrorContext'

// Icons
import { IconExclamationCircle, IconX } from '@tabler/icons-react'

// ==============================|| ResetPasswordPage ||============================== //

const ResetPasswordPage = () => {
    useNotifier()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const emailInput = {
        label: 'Email',
        name: 'email',
        type: 'email',
        placeholder: 'user@company.com'
    }

    const passwordInput = {
        label: 'Password',
        name: 'password',
        type: 'password',
        placeholder: '********'
    }

    const confirmPasswordInput = {
        label: 'Confirm Password',
        name: 'confirmPassword',
        type: 'password',
        placeholder: '********'
    }

    const resetPasswordInput = {
        label: 'Reset Token',
        name: 'resetToken',
        type: 'text'
    }

    const [params] = useSearchParams()
    const token = params.get('token')

    const [emailVal, setEmailVal] = useState('')
    const [newPasswordVal, setNewPasswordVal] = useState('')
    const [confirmPasswordVal, setConfirmPasswordVal] = useState('')
    const [tokenVal, setTokenVal] = useState(token ?? '')

    const [loading, setLoading] = useState(false)
    const [authErrors, setAuthErrors] = useState([])

    const { authRateLimitError, setAuthRateLimitError } = useError()

    const goLogin = () => {
        navigate('/signin', { replace: true })
    }

    const validateAndSubmit = async (event) => {
        event.preventDefault()
        const validationErrors = []
        setAuthErrors([])
        setAuthRateLimitError(null)
        if (!tokenVal) {
            validationErrors.push('Token cannot be left blank!')
        }
        if (newPasswordVal !== confirmPasswordVal) {
            validationErrors.push('New Password and Confirm Password do not match.')
        }
        const passwordErrors = validatePassword(newPasswordVal)
        if (passwordErrors.length > 0) {
            validationErrors.push(...passwordErrors)
        }
        if (validationErrors.length > 0) {
            setAuthErrors(validationErrors)
            return
        }
        const body = {
            user: {
                email: emailVal,
                tempToken: tokenVal,
                password: newPasswordVal
            }
        }
        setLoading(true)
        try {
            const updateResponse = await accountApi.resetPassword(body)
            setAuthErrors([])
            setLoading(false)
            if (updateResponse.data) {
                enqueueSnackbar({
                    message: 'Password reset successful',
                    options: {
                        key: new Date().getTime() + Math.random(),
                        variant: 'success',
                        action: (key) => (
                            <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                <IconX />
                            </Button>
                        )
                    }
                })
                setEmailVal('')
                setTokenVal('')
                setNewPasswordVal('')
                setConfirmPasswordVal('')
                goLogin()
            }
        } catch (error) {
            setLoading(false)
            setAuthErrors([typeof error.response.data === 'object' ? error.response.data.message : error.response.data])
            enqueueSnackbar({
                message: `Failed to reset password!`,
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error',
                    persist: true,
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                            <IconX />
                        </Button>
                    )
                }
            })
        }
    }

    useEffect(() => {
        setAuthRateLimitError(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
                            {authErrors && authErrors.length > 0 && (
                                <Alert icon={<IconExclamationCircle />} variant='filled' severity='error'>
                                    <ul style={{ margin: 0 }}>
                                        {authErrors.map((msg, key) => (
                                            <li key={key}>{msg}</li>
                                        ))}
                                    </ul>
                                </Alert>
                            )}
                            {authRateLimitError && (
                                <Alert icon={<IconExclamationCircle />} variant='filled' severity='error'>
                                    {authRateLimitError}
                                </Alert>
                            )}
                            <Stack sx={{ gap: 1 }}>
                                <Typography variant='h2' sx={{ color: 'rgba(255,255,255,.92)', fontWeight: 700 }}>
                                    Reset your password
                                </Typography>
                                <Typography variant='body2' sx={{ color: 'rgba(255,255,255,.68)' }}>
                                    <Link style={{ color: 'rgba(255,255,255,.92)' }} to='/signin'>
                                        Back to Login
                                    </Link>
                                    .
                                </Typography>
                            </Stack>
                            <form onSubmit={validateAndSubmit}>
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
                                        },
                                        '& textarea::placeholder': {
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
                                            inputParam={emailInput}
                                            onChange={(newValue) => setEmailVal(newValue)}
                                            value={emailVal}
                                            showDialog={false}
                                        />
                                    </Box>
                                    <Box>
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            <Typography sx={{ color: 'rgba(255,255,255,.82)', fontWeight: 650 }}>
                                                Reset Token<span style={{ color: '#ff453a' }}>&nbsp;*</span>
                                            </Typography>
                                            <div style={{ flexGrow: 1 }}></div>
                                        </div>
                                        <OutlinedInput
                                            fullWidth
                                            type='string'
                                            placeholder='Paste in the reset token.'
                                            multiline={true}
                                            rows={3}
                                            inputParam={resetPasswordInput}
                                            onChange={(e) => setTokenVal(e.target.value)}
                                            value={tokenVal}
                                            sx={{
                                                mt: 1,
                                                backgroundColor: 'rgba(0,0,0,.18)',
                                                borderRadius: '14px',
                                                color: 'rgba(255,255,255,.92)',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'rgba(255,255,255,.14)'
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'rgba(255,255,255,.2)'
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'rgba(10,132,255,.55)'
                                                },
                                                '& textarea::placeholder': {
                                                    color: 'rgba(255,255,255,.42)'
                                                }
                                            }}
                                        />
                                        <Typography variant='caption' sx={{ color: 'rgba(255,255,255,.58)' }}>
                                            <i>Please copy the token you received in your email.</i>
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            <Typography sx={{ color: 'rgba(255,255,255,.82)', fontWeight: 650 }}>
                                                New Password<span style={{ color: '#ff453a' }}>&nbsp;*</span>
                                            </Typography>
                                            <Typography align='left'></Typography>
                                            <div style={{ flexGrow: 1 }}></div>
                                        </div>
                                        <Input
                                            inputParam={passwordInput}
                                            onChange={(newValue) => setNewPasswordVal(newValue)}
                                            value={newPasswordVal}
                                            showDialog={false}
                                        />
                                        <Typography variant='caption' sx={{ color: 'rgba(255,255,255,.58)' }}>
                                            <i>
                                                Password must be at least 8 characters long and contain at least one lowercase letter, one
                                                uppercase letter, one digit, and one special character.
                                            </i>
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            <Typography sx={{ color: 'rgba(255,255,255,.82)', fontWeight: 650 }}>
                                                Confirm Password<span style={{ color: '#ff453a' }}>&nbsp;*</span>
                                            </Typography>
                                            <div style={{ flexGrow: 1 }}></div>
                                        </div>
                                        <Input
                                            inputParam={confirmPasswordInput}
                                            onChange={(newValue) => setConfirmPasswordVal(newValue)}
                                            value={confirmPasswordVal}
                                            showDialog={false}
                                        />
                                        <Typography variant='caption' sx={{ color: 'rgba(255,255,255,.58)' }}>
                                            <i>Confirm your new password. Must match the password typed above.</i>
                                        </Typography>
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
                                        type='submit'
                                    >
                                        Update Password
                                    </StyledButton>
                                </Stack>
                            </form>
                        </Stack>
                    </MainCard>
                </Box>
            </Box>
            {loading && <BackdropLoader open={loading} />}
        </>
    )
}

export default ResetPasswordPage
