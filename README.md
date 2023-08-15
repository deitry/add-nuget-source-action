# Add Nuget Source action

Adds NuGet source and removes it in the end of the workflow. This is useful when adding private package source to self-hosted runners and allows to keep it always in actual state without messing with prior settings.

## Example

```yaml
- name: Add NuGet package source
  uses: deitry/add-nuget-source-action@v1
  with:
    url: https://nuget.pkg.github.com/my-org/index.json
    username: arrivederci
    password: ${{ secrets.MY_SECRET }}
```