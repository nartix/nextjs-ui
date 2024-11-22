sequenceDiagram
participant Client as Browser
participant Frontend as Next.js Frontend
participant LoginAction as loginAction
participant SignIn as signIn
participant CredentialsProvider as CredentialsProvider
participant AuthProvider as AuthenticationProvider
participant ApiAdaptor as ApiAdaptor
participant Backend as Spring Boot API
participant AuthService as Authentication Service
participant Translations as getTranslations
participant SessionAdaptor as SessionAdaptor

    Client->>Frontend: Navigate to /login
    Client->>Frontend: Enter username & password
    Client->>Frontend: Submit login form
    Frontend->>LoginAction: Trigger loginAction(formData)
    LoginAction->>Translations: getTranslations()
    LoginAction->>SignIn: signIn(credentialsProvider, {username, password}, ApiAdaptor(null))
    SignIn->>AuthProvider: authenticateWithProvider(credentialsProvider, credentials)
    AuthProvider->>CredentialsProvider: authorize(credentials)
    CredentialsProvider-->>AuthProvider: User object / null
    alt User Authenticated
        AuthProvider-->>SignIn: User object
        SignIn->>SessionAdaptor: createSession(sessionObj)
        SessionAdaptor-->>SignIn: session details
        SignIn-->>LoginAction: User object
    else Authentication Failed
        AuthProvider-->>SignIn: null
        SignIn-->>LoginAction: null
    end
    alt Authentication Successful
        LoginAction-->>Frontend: { success: true }
        Frontend->>Client: Redirect to dashboard/homepage
    else Authentication Failed
        LoginAction-->>Frontend: { success: false, message: t('auth.error_invalid_credentials') }
        Frontend->>Client: Display error message
    end
