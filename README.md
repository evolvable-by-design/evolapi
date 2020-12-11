# EvolApi

_EvolApi_ is a REST API that has 110 API evolutions of 25 different types that are distributed in 16 versions. Our goal is to offer a reference, complete, example of an evolving API to help anyone study this subject.

Hence, the core of _EvolApi_ is the Open Api description of the aforementioned REST API that you can find in [the _rest-api_ directory](/rest-api). In this directory, you will also find more details about the API.

Along with the API, for each version, we propose servers and clients implementations. You can find a detailed list of them under the **Available Implementations** section.

_EvolApi_ is a realistic web application imitating the project management software [Jira](https://www.atlassian.com/software/jira). With this API, multiple users collaborate on projects. A user can create public or private projects, invite other users to collaborate on the project, archive, delete or add tasks to it. The tasks have several operations and well-defined state transitions: they must be archived to be removable and only the tasks in a certain state can be completed. The REST API has up to 28 operations, depending on the version. For a more detailed list, take a look at the versions in [the _rest-api_ directory](/rest-api).

**Contributions to this repository are very welcome.** To do so, you can refer to the [contributing guide](/CONTRIBUTING.md). Among the contributions, we are looking for new implementations, either in different technologies such as TypeScript, Java or Angular, for new clients offering a different usage of the API, and we are also looking for new evolutions that may make this dataset more complete. One of our goals is to better serve the Software Engineering community by proposing a reference dataset for REST API evolutions.

This software is distributed under the MIT license which gives full edition and usage freedom. See [LICENSE.md](LICENSE.md).

## Available Implementations

Two types of implementations are available: servers of the _EvolApi_, and clients that use it.

### Servers

At the moment, a single implementation is available. It has been developed with NodeJS. Contributions in any additional language are welcome. For more information please refer to the [contributing guide](/CONTRIBUTING.md).

- [NodeJS](/servers/node)

### Clients

At the moment, a single client is available in the form of a web user interface implemented as a single-page application with React in JavaScript (no TypeScript). Contributions are also welcome here, for example of different clients (UI or not) or within different languagues and technologies. For more information please refer to the [contributing guide](/CONTRIBUTING.md).

- [Web UI in React JavaScript](/clients/web-ui-react-js)

## Questions and feedbacks are welcome

Anyone is free to propose help, ask ourselves questions and share feedbacks with us. Fell free to [open an issue](https://github.com/evolvable-by-design/evolapi/issues/new) for this purpose.
