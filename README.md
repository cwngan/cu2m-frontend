# cu2m Frontend

## Development

### Through Docker Compose Container (Recommended)

This utilizes the Docker Container in [cu2m](https://github.com/cwngan/cu2m) repo where this current repo is used as a submodule. Follow the instruction at [cu2m](https://github.com/cwngan/cu2m) for starting up a development server at http://localhost/.

### Directly on Host Computer

1. Run the following command to install all related node modules.

```sh
yarn
```

2. Run the following command to start up the development server.

```sh
yarn dev
```

This command should start a development server at http://localhost:3000/

### Environment Setup

Create a `.env` file at the root directory and make sure to include the following two variables: `API_URL` and `NEXT_PUBLIC_API_URL`.

Since `API_URL` is used server side, use http://cu2m-backend:5000/ if you are running the development server through the [cu2m](https://github.com/cwngan/cu2m) container. Otherwise, it should be set to the actual URL to the backend server (eg. http://localhost:8080).

`NEXT_PUBLIC_API_URL` should be set to the actual URL to the backend server disregarding the development mode.

## Production

Check [cu2m](https://github.com/cwngan/cu2m) for more information.
