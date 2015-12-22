# http-fs-node
> A node module to manage a remote filesystem via http

> This is a super early stage work in progress (not even using semver yet).
Check back in a few months and hopefully we'll have a working version!

This module is a stateless node implementation of the server-side component of the Brinkbit [http-fs-api](https://github.com/Brinkbit/http-fs-api).

It does not handle the actual implementation of the data storage.
Instead, this simply acts as an interface between the [http api](https://github.com/Brinkbit/http-fs-api) and js api (which is yet to be documentated).
An express middleware wrapper and an aws+mongo data store module are both in the works, to complete the backend implementation.

In the future we plan to build additional data storage and framework support.

# Workflow

![Workflow Diagram](images/fs_workflow.jpg "Workflow Diagram")
