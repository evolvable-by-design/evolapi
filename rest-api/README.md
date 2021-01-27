# _EvolApi_ REST API

The REST API is the core of _EvolApi_ above which are implemented several artifacts such as servers and clients.

The API implements 110 evolutions of all the types of evolution that have been observed in the scientific litterature. These 27 types of evolutions are listed in the below table. We distributed these evolutions into 16 versions.

Functionally, _EvolApi_ imitates the project management software [Jira](https://www.atlassian.com/software/jira). With this API, multiple users collaborate on projects. A user can create public or private projects, invite other users to collaborate on the project, archive, delete or add tasks to it. The tasks have several operations and well-defined state transitions: they must be archived to be removable and only the tasks in a certain state can be completed. The REST API has up to 28 operations, depending on the version.

## Table of contents

- [1 - How can a REST API be evolved?](#rest-api-evolution)
- [2 - Which evolutions are implemented in EvolApi?](#evolutions-in-evolapi)

## <a name="rest-api-evolution"></a> 1 - How can a REST API be evolved?

Leveraging the scientific litterature available ([[1]](#ref1), [[2]](#ref2), [[3]](#ref3)) we produced the following list of REST API evolutions.

| Nb | Description|
| --- | --- |
| 1 | Add or Remove Parameter (✗ breaking) |
| 2 | Change Type of Parameter (✗ breaking) |
| 3 | Change Type of Return Value (✗ breaking) |
| 4 | Delete Method (✗ breaking) |
| 5 | Rename Method (✗ breaking) |
| 6 | Rename Parameter (✗ breaking) |
| 7 | Change Format of Parameter (✗ breaking) |
| 8 | Change Format of Return Value (✗ breaking) |
| 9 | Combine Methods (✗ breaking) |
| 10 | Split Method (✗ breaking) |
| 11 | Change Media-Type of Return Value (✗ breaking) |
| 12 | Restrict Access to API (✓ non-breaking) |
| 13 | Move API elements (✗ breaking) |
| 14 | Rename API elements (✗ breaking) |
| 15 | Behavior change (✓ non-breaking) |
| 16 | Post condition change (✓ non-breaking) |
| 17 | HTTP header change (✗ breaking) |
| 18 | Error condition change (✓ non-breaking) |
| 19 | Change Parameter's Schema Constraints (✓ non-breaking) |
| 20 | Add operation (✓ non-breaking) |
| 21 | Add API elements (✓ non-breaking) |
| 22 | Change Request Method (e.g. POST, PUT, etc.) (✗ breaking) |
| 23 | Precondition change (✓ non-breaking) |
| 24 | The order in which a set of operations must be played to achieve a business process changed (✓ non-breaking) |
| 25 | The set of operations to execute to achieve a business process changed (✓ non-breaking) |
| 26 | Move Parameters (✗ breaking) |
| 27 | Remove API elements (✗ breaking) |


To get more details along with example illustrating each type of evolution, please refer to the [details of REST API evolutions document](/documentation/detailed-rest-api-evolutions.md)

## <a name="evolutions-in-evolapi"></a> 2 - Which evolutions are implemented in EvolApi?

We leveraged the above table to include at least one evolution of each type in _EvolApi_.

We give a list that links the types of evolutions to the actual evolutions in _EvolApi_ along with the version implementing it in [this document](/rest-api/evolution-type-to-instance-list.md).

We also give a list that links the versions of the REST API to the evolutions that they implement. See [this document](/rest-api/evolutions-per-version-list.md)

> TODO: after finishing the two lists, maybe put them back into this section, under two subsections

## References

- <a name="ref1"></a> [Li et. al - How does web service API evolution affect clients?](http://sei.pku.edu.cn/~zhanglu/Download/icws13.pdf)
- <a name="ref2"></a> [Sohan et. al - A case study of web API evolution](http://anslow.cpsc.ucalgary.ca/papers/services2015-sohan.pdf)
- <a name="ref3"></a> [Wang et. al - How do developers react to restful api evolution?](https://seal-queensu.github.io/publications/pdf/ICSOC-Shaohua-2014.pdf)
