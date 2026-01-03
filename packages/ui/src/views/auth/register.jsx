import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'

// material-ui
import { Alert, Box, Button, Divider, Icon, List, ListItemText, OutlinedInput, Stack, Typography } from '@mui/material'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import { StyledButton } from '@/ui-component/button/StyledButton'
import { Input } from '@/ui-component/input/Input'
import { BackdropLoader } from '@/ui-component/loading/BackdropLoader'

// API
import accountApi from '@/api/account.api'
import loginMethodApi from '@/api/loginmethod'
import ssoApi from '@/api/sso'

// Hooks
import useApi from '@/hooks/useApi'
import { useConfig } from '@/store/context/ConfigContext'
import { useError } from '@/store/context/ErrorContext'

// utils
import useNotifier from '@/utils/useNotifier'
import { passwordSchema } from '@/utils/validation'

// Icons
import Auth0SSOLoginIcon from '@/assets/images/auth0.svg'
import GithubSSOLoginIcon from '@/assets/images/github.svg'
import GoogleSSOLoginIcon from '@/assets/images/google.svg'
import AzureSSOLoginIcon from '@/assets/images/microsoft-azure.svg'
import { store } from '@/store'
import { loginSuccess } from '@/store/reducers/authSlice'
import { IconCircleCheck, IconExclamationCircle } from '@tabler/icons-react'

// ==============================|| Register ||============================== //

// IMPORTANT: when updating this schema, update the schema on the server as well
// packages/server/src/enterprise/Interface.Enterprise.ts
const RegisterEnterpriseUserSchema = z
    .object({
        username: z.string().min(1, 'Name is required'),
        email: z.string().min(1, 'Email is required').email('Invalid email address'),
        password: passwordSchema,
        confirmPassword: z.string().min(1, 'Confirm Password is required'),
        token: z.string().optional()
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword']
    })

const RegisterCloudUserSchema = z
    .object({
        username: z.string().min(1, 'Name is required'),
        email: z.string().min(1, 'Email is required').email('Invalid email address'),
        password: passwordSchema,
        confirmPassword: z.string().min(1, 'Confirm Password is required')
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword']
    })

const RegisterPage = () => {
    useNotifier()
    const { isEnterpriseLicensed, isCloud, isOpenSource } = useConfig()

    const usernameInput = {
        label: 'Username',
        name: 'username',
        type: 'text',
        placeholder: 'John Doe'
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

    const emailInput = {
        label: 'EMail',
        name: 'email',
        type: 'email',
        placeholder: 'user@company.com'
    }

    const inviteCodeInput = {
        label: 'Invite Code',
        name: 'inviteCode',
        type: 'text'
    }

    const [params] = useSearchParams()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [token, setToken] = useState(params.get('token') ?? '')
    const [username, setUsername] = useState('')
    const [configuredSsoProviders, setConfiguredSsoProviders] = useState([])

    const [loading, setLoading] = useState(false)
    const [authError, setAuthError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    const { authRateLimitError, setAuthRateLimitError } = useError()

    const registerApi = useApi(accountApi.registerAccount)
    const ssoLoginApi = useApi(ssoApi.ssoLogin)
    const getDefaultProvidersApi = useApi(loginMethodApi.getDefaultLoginMethods)
    const navigate = useNavigate()

    const register = async (event) => {
        event.preventDefault()
        setAuthRateLimitError(null)
        if (isEnterpriseLicensed) {
            const result = RegisterEnterpriseUserSchema.safeParse({
                username,
                email,
                token,
                password,
                confirmPassword
            })
            if (result.success) {
                setLoading(true)
                const body = {
                    user: {
                        name: username,
                        email,
                        credential: password,
                        tempToken: token
                    }
                }
                await registerApi.request(body)
            } else {
                const errorMessages = result.error.errors.map((err) => err.message)
                setAuthError(errorMessages.join(', '))
            }
        } else if (isCloud) {
            const formData = new FormData(event.target)
            const referral = formData.get('referral')
            const result = RegisterCloudUserSchema.safeParse({
                username,
                email,
                password,
                confirmPassword
            })
            if (result.success) {
                setLoading(true)
                const body = {
                    user: {
                        name: username,
                        email,
                        credential: password
                    }
                }
                if (referral) {
                    body.user.referral = referral
                }
                await registerApi.request(body)
            } else {
                const errorMessages = result.error.errors.map((err) => err.message)
                setAuthError(errorMessages.join(', '))
            }
        }
    }

    const signInWithSSO = (ssoProvider) => {
        //ssoLoginApi.request(ssoProvider)
        window.location.href = `/api/v1/${ssoProvider}/login`
    }

    useEffect(() => {
        if (registerApi.error) {
            if (isEnterpriseLicensed) {
                setAuthError(
                    `Error in registering user. Please contact your administrator. (${registerApi.error?.response?.data?.message})`
                )
            } else if (isCloud) {
                setAuthError(`Error in registering user. Please try again.`)
            }
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [registerApi.error])

    useEffect(() => {
        setAuthRateLimitError(null)
        if (!isOpenSource) {
            getDefaultProvidersApi.request()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
        if (registerApi.data) {
            setLoading(false)
            setAuthError(undefined)
            setConfirmPassword('')
            setPassword('')
            setToken('')
            setUsername('')
            setEmail('')
            if (isEnterpriseLicensed) {
                setSuccessMsg('Registration Successful. You will be redirected to the sign in page shortly.')
            } else if (isCloud) {
                setSuccessMsg('To complete your registration, please click on the verification link we sent to your email address')
            }
            setTimeout(() => {
                navigate('/signin')
            }, 3000)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [registerApi.data])

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
                <MainCard
                    sx={{
                        width: '100%',
                        maxWidth: 560,
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
                                Sign up
                            </Button>
                            <Button
                                component={Link}
                                to='/signin'
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
                                Sign in
                            </Button>
                        </Stack>
                        {authError && (
                            <Alert icon={<IconExclamationCircle />} variant='filled' severity='error'>
                                {authError.split(', ').length > 0 ? (
                                    <List dense sx={{ py: 0 }}>
                                        {authError.split(', ').map((error, index) => (
                                            <ListItemText key={index} primary={error} primaryTypographyProps={{ color: '#fff !important' }} />
                                        ))}
                                    </List>
                                ) : (
                                    authError
                                )}
                            </Alert>
                        )}
                        {authRateLimitError && (
                            <Alert icon={<IconExclamationCircle />} variant='filled' severity='error'>
                                {authRateLimitError}
                            </Alert>
                        )}
                        {successMsg && (
                            <Alert icon={<IconCircleCheck />} variant='filled' severity='success'>
                                {successMsg}
                            </Alert>
                        )}
                        <Stack sx={{ gap: 1 }}>
                            <Typography variant='h2' sx={{ color: 'rgba(255,255,255,.92)', fontWeight: 700 }}>
                                Create your account
                            </Typography>
                            <Typography variant='body2' sx={{ color: 'rgba(255,255,255,.68)' }}>
                                Already have an account?{' '}
                                <Link style={{ color: 'rgba(255,255,255,.92)' }} to='/signin'>
                                    Sign In
                                </Link>
                                .
                            </Typography>
                        </Stack>
                        <form onSubmit={register} data-rewardful>
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
                                            Full Name<span style={{ color: '#ff453a' }}>&nbsp;*</span>
                                        </Typography>
                                        <div style={{ flexGrow: 1 }}></div>
                                    </div>
                                    <Input
                                        inputParam={usernameInput}
                                        placeholder='Display Name'
                                        onChange={(newValue) => setUsername(newValue)}
                                        value={username}
                                        showDialog={false}
                                    />
                                    <Typography variant='caption' sx={{ color: 'rgba(255,255,255,.58)' }}>
                                        <i>Is used for display purposes only.</i>
                                    </Typography>
                                </Box>
                                <Box>
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        <Typography sx={{ color: 'rgba(255,255,255,.82)', fontWeight: 650 }}>
                                            Email<span style={{ color: '#ff453a' }}>&nbsp;*</span>
                                        </Typography>
                                        <div style={{ flexGrow: 1 }}></div>
                                    </div>
                                    <Input
                                        inputParam={emailInput}
                                        onChange={(newValue) => setEmail(newValue)}
                                        value={email}
                                        showDialog={false}
                                    />
                                    <Typography variant='caption' sx={{ color: 'rgba(255,255,255,.58)' }}>
                                        <i>Kindly use a valid email address. Will be used as login id.</i>
                                    </Typography>
                                </Box>
                                {isEnterpriseLicensed && (
                                    <Box>
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            <Typography sx={{ color: 'rgba(255,255,255,.82)', fontWeight: 650 }}>Invite Code</Typography>
                                            <div style={{ flexGrow: 1 }}></div>
                                        </div>
                                        <OutlinedInput
                                            fullWidth
                                            type='string'
                                            placeholder='Paste in the invite code.'
                                            multiline={false}
                                            inputParam={inviteCodeInput}
                                            onChange={(e) => setToken(e.target.value)}
                                            value={token}
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
                                                '& input::placeholder': {
                                                    color: 'rgba(255,255,255,.42)'
                                                }
                                            }}
                                        />
                                        <Typography variant='caption' sx={{ color: 'rgba(255,255,255,.58)' }}>
                                            <i>Please copy the token you would have received in your email.</i>
                                        </Typography>
                                    </Box>
                                )}
                                <Box>
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        <Typography sx={{ color: 'rgba(255,255,255,.82)', fontWeight: 650 }}>
                                            Password<span style={{ color: '#ff453a' }}>&nbsp;*</span>
                                        </Typography>
                                        <div style={{ flexGrow: 1 }}></div>
                                    </div>
                                    <Input inputParam={passwordInput} onChange={(newValue) => setPassword(newValue)} value={password} />
                                    <Typography variant='caption' sx={{ color: 'rgba(255,255,255,.58)' }}>
                                        <i>
                                            Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase
                                            letter, one digit, and one special character.
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
                                        onChange={(newValue) => setConfirmPassword(newValue)}
                                        value={confirmPassword}
                                    />
                                    <Typography variant='caption' sx={{ color: 'rgba(255,255,255,.58)' }}>
                                        <i>Confirm your password. Must match the password typed above.</i>
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
                                    Create Account
                                </StyledButton>
                                {configuredSsoProviders.length > 0 && (
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
            {loading && <BackdropLoader open={loading} />}
        </>
    )
}

export default RegisterPage
