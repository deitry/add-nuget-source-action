# Add Nuget Source action

Adds NuGet source and removes it in the end of the workflow. This is useful when adding private package source to self-hosted runners and allows to keep it always in actual state without messing with prior settings.

## Example

```yaml
- name: Add NuGet package source
  id: add-source
  uses: deitry/add-nuget-source-action@v2
  with:
    url: https://nuget.pkg.github.com/my-org/index.json
    name: my-private-source
    username: arrivederci
    password: ${{ secrets.MY_SECRET }}
    force: true
```

You can then reference the source name in subsequent steps:

```yaml
- name: Push package
  run: dotnet nuget push MyPackage.nupkg --source my-private-source
```

If `name` is not specified, a random GUID is used. You can still get the name via the `source_name` output:

```yaml
- run: echo "Source name is ${{ steps.add-source.outputs.source_name }}"
```
