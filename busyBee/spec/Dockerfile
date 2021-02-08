FROM batch-decipher-pst_busybee
# TODO: add coverage dep
COPY --from=shellspec/shellspec-scratch /opt/shellspec /opt/shellspec
ENV PATH /opt/shellspec/:$PATH
ENTRYPOINT [ "shellspec", "--no-warning-as-failure"]